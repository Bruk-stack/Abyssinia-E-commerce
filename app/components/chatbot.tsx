"use client";

import { MessageSquare } from "lucide-react";

interface FloatingChatButtonProps {
  onClick?: () => void;
  badgeCount?: number;
  tooltip?: string;
  className?: string;
}

export function FloatingChatButton({
  onClick,
  badgeCount,
  tooltip = "Chat with us",
  className = "",
}: FloatingChatButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={tooltip}
      className={`fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full 
        bg-gradient-to-r from-orange-500 to-amber-500 
        dark:from-orange-600 dark:to-amber-600
        text-white 
        shadow-lg hover:shadow-orange-500/40 
        hover:scale-105 active:scale-95 
        transition-all duration-200 
        focus:outline-none focus:ring-4 focus:ring-orange-500/30 
        ${className}`}
    >
      <MessageSquare className="h-6 w-6" />

      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white animate-pulse">
          {badgeCount > 9 ? "9+" : badgeCount}
        </span>
      )}
    </button>
  );
}
