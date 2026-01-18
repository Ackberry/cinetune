"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  profiles: {
    username: string | null;
    display_name: string | null;
  } | null;
};

type RawMessage = {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  profiles: { username: string | null; display_name: string | null } | { username: string | null; display_name: string | null }[] | null;
};

function normalizeMessage(raw: RawMessage): Message {
  return {
    ...raw,
    profiles: Array.isArray(raw.profiles) ? raw.profiles[0] ?? null : raw.profiles,
  };
}

function getDateKey(dateString: string) {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatDateLabel(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const todayKey = getDateKey(now.toISOString());
  const dateKey = getDateKey(dateString);

  if (dateKey === todayKey) {
    return "Today";
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayKey = getDateKey(yesterday.toISOString());
  if (dateKey === yesterdayKey) {
    return "Yesterday";
  }

  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

type Props = {
  conversationId: string;
  currentUserId: string;
  initialMessages: RawMessage[];
  chatName: string;
};

export default function ChatMessages({
  conversationId,
  currentUserId,
  initialMessages,
  chatName,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(() => initialMessages.map(normalizeMessage));
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Subscribe to new messages
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Fetch the complete message with sender info
          const { data: newMsg } = await supabase
            .from("messages")
            .select("id, content, created_at, sender_id, profiles(username, display_name)")
            .eq("id", payload.new.id)
            .single();

          if (newMsg) {
            setMessages((prev) => [...prev, normalizeMessage(newMsg as RawMessage)]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  // Mark as read when chat opens
  useEffect(() => {
    const markRead = async () => {
    };

    markRead();
  }, [conversationId, currentUserId, supabase]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: newMessage.trim(),
    });

    if (!error) {
      setNewMessage("");
    }
    setSending(false);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{chatName}</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => {
          const isOwn = msg.sender_id === currentUserId;
          const prev = messages[index - 1];
          const showDateDivider =
            index === 0 || getDateKey(prev.created_at) !== getDateKey(msg.created_at);
          return (
            <div key={msg.id}>
              {showDateDivider && (
                <div className="flex items-center justify-center my-2">
                  <span className="text-xs text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full">
                    {formatDateLabel(msg.created_at)}
                  </span>
                </div>
              )}
              <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] ${isOwn ? "bg-blue-600" : "bg-zinc-800"} rounded-2xl px-4 py-2`}>
                  {!isOwn && (
                    <p className="text-xs text-zinc-400 mb-1">
                      {msg.profiles?.display_name || msg.profiles?.username}
                    </p>
                  )}
                  <p>{msg.content}</p>
                  <p className={`text-xs mt-1 ${isOwn ? "text-blue-200" : "text-zinc-500"}`}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-zinc-900 border-t border-zinc-800 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-full px-4 py-2 focus:outline-none focus:border-zinc-500"
          />
          <button
            onClick={handleSend}
            disabled={sending || !newMessage.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-500 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
