"use Client";
import { Companion } from "@prisma/client";
import { ChatMessage, ChatMessageProps } from "./chat-message";
import { ComponentRef, useEffect, useRef, useState } from "react";

interface ChatMessagesProps {
    messages: ChatMessageProps[];
    companion: Companion;
    isLoading: boolean;
}

export const ChatMessages = ({ messages = [], companion, isLoading }: ChatMessagesProps) => {
    const scrollRef = useRef<ComponentRef<"div">>(null);

    const [fakeLoading, setFakeLoading] = useState(messages.length === 0);

    useEffect(() => {
        if (fakeLoading) {
            const timeout = setTimeout(() => {
                setFakeLoading(false);
            }, 1000);
            return () => clearTimeout(timeout);
        }
    }, [fakeLoading]);

    useEffect(() => {
        if (messages.length > 0) {
            scrollRef?.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages.length]);

    return (
        <div className="flex-1 overflow-y-auto pr-4">
            <ChatMessage
                isLoading={fakeLoading}
                src={companion.src}
                role="system"
                content={`Hello, I am ${companion.name}, ${companion.description}`}
            />
            {messages.map((message, index) => (
                <ChatMessage key={index} role={message.role} content={message.content} src={message.src} />
            ))}
            {isLoading && <ChatMessage role="system" src={companion.src} isLoading content="Loading..." />}
            <div ref={scrollRef} />
        </div>
    );
};
