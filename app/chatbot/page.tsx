// app/chatbot/page.tsx
"use client";

import { useState } from "react";
import { ChatInterface, type Message } from "./components/chatInterface";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.text }),
        credentials: "include",
      });

      const data = await res.json();
      console.log(data);

      if (!data.success) {
        console.log(data.error);
        // Optional: Show error message to user
        return;
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error("Chat error:", err.message);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <ChatInterface
      messages={messages}
      input={input}
      isTyping={isTyping}
      onInputChange={setInput}
      onSendMessage={handleSendMessage}
    />
  );
}
