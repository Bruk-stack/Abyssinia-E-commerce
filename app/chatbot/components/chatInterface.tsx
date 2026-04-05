"use client";

import { useRef, useEffect } from "react";

export type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
};

interface ChatInterfaceProps {
  messages: Message[];
  input: string;
  isTyping: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
}

export function ChatInterface({
  messages,
  input,
  isTyping,
  onInputChange,
  onSendMessage,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-3 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md">
          🤖
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
            Bot Assistant
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isTyping ? (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                typing...
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                online
              </span>
            )}
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center text-2xl mb-4">
              💬
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Start a conversation
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              Ask me anything about products, orders, or recommendations. I'm
              here to help!
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl shadow-sm text-sm ${
                msg.sender === "user"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-br-md"
                  : "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800 rounded-bl-md"
              }`}
            >
              <p className="whitespace-pre-wrap break-words leading-relaxed">
                {msg.text}
              </p>
              <p
                className={`text-[10px] mt-1.5 text-right ${
                  msg.sender === "user"
                    ? "text-white/80"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {msg.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm flex gap-1.5 items-center">
              <span
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={onSendMessage}
        className="sticky bottom-0 z-10 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-3"
      >
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSendMessage(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-full font-medium text-sm shadow-md hover:shadow-orange-500/30 disabled:shadow-none transition-all active:scale-[0.98] disabled:active:scale-100 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-2">
          AI-generated{" "}
          <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded font-mono">
            content may
          </kbd>{" "}
          not be accurate.
        </p>
      </form>
    </div>
  );
}
