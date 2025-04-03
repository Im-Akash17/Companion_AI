import { RedirectToSignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { redirect } from "next/navigation";
import ChatClient from "./components/client";

// interface ChatIdPageProps {
//     params: {
//         chatId: Promise<string>;
//     };
// }

const ChatIdPage = async ({ params }: { params: Promise<{ chatId: string }> }) => {
    const { userId } = await auth();

    if (!userId) {
        return <RedirectToSignIn />; // Ensure redirection is returned
    }

    const { chatId } = await params;

    const companion = await prismadb.companion.findUnique({
        where: {
            id: chatId,
        },
        include: {
            messages: {
                orderBy: {
                    createdAt: "asc",
                },
                ...(userId ? { where: { userId } } : {}), // Only apply filter if userId is valid
            },
            _count: {
                select: {
                    messages: true,
                },
            },
        },
    });

    if (!companion) {
        return redirect("/");
    }

    return (
        <ChatClient companion={companion} />
    );
};

export default ChatIdPage;
