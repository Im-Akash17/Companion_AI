"use client"
import { Companion,Message } from "@prisma/client"
import { ChatHeader } from "./chat-header"
import { useRouter } from "next/navigation";
import { FormEvent,useState } from "react";
import { useCompletion } from '@ai-sdk/react'
import { ChatForm } from "@/components/chat-form";
import { ChatMessages } from "@/components/chat-messages";
import { ChatMessageProps } from "@/components/chat-message";

interface ChatClientProps{
    companion: Companion&{
        messages: Message[];
        _count:{
            messages:number;
        };
    }
}

export const ChatClient  = ({
    companion
}: ChatClientProps) => {
    const router = useRouter();
    const [messages,setMessages] = useState<ChatMessageProps[]>(companion.messages);
    const {
        input,
        isLoading,
        handleInputChange,
        handleSubmit,
        setInput,
    } = useCompletion({
            api: `/api/chat/${companion.id}`,
            onFinish(prompt, completion) {
                console.log("qwertyu",completion)
                setMessages((current) => {
                    if (current.some((msg) => msg.content === completion)) {
                        console.log("Skipping duplicate message update.");
                        return current;
                    }
                    return [...current, { role: "system", content: completion }];
                });
        
                setInput(""); // ✅ Ensure it doesn't cause re-renders
        
                setTimeout(() => {
                    router.refresh(); // ✅ Prevent instant re-render loops
                }, 500);
            }
    });

    const onSubmit= (e: FormEvent<HTMLFormElement>)=>{
        const userMessage: ChatMessageProps = {
            role: "user",
            content: input,
        }
        setMessages((current) => [...current,userMessage]);
        handleSubmit(e);
    }


    return ( 
        <div className="flex flex-col h-full p-4 space-y-2">
            <ChatHeader companion = {companion}/>
            <ChatMessages
                companion={companion}
                isLoading={isLoading}
                messages={messages}
            />
            <ChatForm
                isLoading={isLoading}
                input={input}
                handleInputChange={handleInputChange}
                onSubmit={onSubmit}
            />

        </div>
    );
}
 
export default ChatClient ;