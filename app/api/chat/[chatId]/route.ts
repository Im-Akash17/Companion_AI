import dotenv from "dotenv";
import { LangChainAdapter } from "ai";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { MemoryManager } from "@/lib/memory";
import { rateLimit } from "@/lib/rate-limit";
import prismadb from "@/lib/prismadb";
import { ChatOpenAI } from "@langchain/openai";

dotenv.config({ path: `.env` });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    const { prompt } = await request.json();
    const user = await currentUser();

    // Validate user
    if (!user || !user.firstName || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is missing");
      return new NextResponse("OpenAI API key is missing", { status: 500 });
    }

    // Rate limiting
    const identifier = request.url + "-" + user.id;
    const { success } = await rateLimit(identifier);
    console.log("Rate limit identifier:", identifier);
    console.log("Rate limit success:", success);

    if (!success) {
      return new NextResponse("Rate limit exceeded", { status: 429 });
    }

    // Correctly extract chatId
    const { chatId } = await params;

    // Update companion with the new user message
    const companion = await prismadb.companion.update({
      where: { id: chatId },
      data: {
        messages: {
          create: { content: prompt, role: "user", userId: user.id },
        },
      },
    });

    if (!companion) {
      return new NextResponse("Companion not found", { status: 404 });
    }

    // Initialize memory manager and companion key
    const companionKey = {
      configuration: { baseURL: "https://openrouter.ai/api/v1" },
      companionId: companion.id,
      userId: user.id,
      modelName: "meta-llama/llama-3.2-3b-instruct:free",
    };

    const memoryManager = await MemoryManager.getInstance();
    const records = await memoryManager.readLatestHistory(companionKey);

    if (records.length === 0) {
      await memoryManager.seedChatHistory(companion.seed, "\n\n", companionKey);
    }

    await memoryManager.writeToHistory("User: " + prompt + "\n", companionKey);

    // Query Pinecone for relevant history
    const recentChatHistory = await memoryManager.readLatestHistory(companionKey);
    const similarDocs = await memoryManager.vectorSearch(
      recentChatHistory,
      companion.id + ".txt"
    );

    console.log("Recent chat history:", recentChatHistory);
    console.log("Similar docs:", similarDocs);

    let relevantHistory = "";
    if (similarDocs?.length) {
      relevantHistory = similarDocs.map((doc) => doc.pageContent).join("\n");
    }

    // Use LangChainAdapter with ChatOpenAI
    const model = new ChatOpenAI({
      configuration: { baseURL: "https://openrouter.ai/api/v1" },
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "meta-llama/llama-3.2-3b-instruct:free",
      verbose: true,
    });

    // Generate response using LangChain
    const langChainStream = await model.stream(
      `${companion.instructions}
      
      Try to give responses that are straight to the point.
      Below are relevant details about ${companion.name}'s past and the conversation you are in.
      ${relevantHistory}

      ${recentChatHistory}
      ${companion.name}:`
    );

    // Convert the stream to a response using LangChainAdapter
    const responseStream = LangChainAdapter.toDataStreamResponse(langChainStream);

    // Fix: Clone the stream to avoid ReadableStream lock issue
    const clonedResponse = responseStream.clone();
    const content = await new Response(clonedResponse.body).text();
    const clearContent = content
    .replace(/\n/g, " ")                      // Keep this to replace newlines with a space
    .split("0:\"").join("")                   // Keep this to remove the unwanted `0:\"` pattern
    .replace(/^\"|\"$/g, "")                  // Keep this to remove the quotes at the start and end of the string
    .replace(/\"/g, "")                       // Remove all double quotes from the content
    .replace(/\s+/g, " ")                     // Replace any sequence of spaces (including tabs) with a single space
    .replace(/^\s+|\s+$/g, "");               // Remove leading and trailing spaces


    // Write response to memory
    await memoryManager.writeToHistory(content, companionKey);

    // Update companion with the system message
    await prismadb.companion.update({
      where: { id: chatId },
      data: {
        messages: {
          create: { content: clearContent, role: "system", userId: user.id },
        },
      },
    });

    // Return the streaming response
    return responseStream;
  } catch (error) {
    console.error("[COMPANION_POST_ERROR]", error);

    // Ensure error is an instance of Error before accessing .message
    if (error instanceof Error && error.message.includes("Rate limit exceeded")) {
      return new NextResponse("Rate limit exceeded", { status: 429 });
    }

    return new NextResponse("Internal Error", { status: 500 });
  }

}
