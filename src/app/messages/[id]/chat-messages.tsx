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

function getReadLabel(
  messages: Message[],
  currentUserId: string,
  otherLastReadAt: string | null
) {
  const lastOwn = [...messages]
    .reverse()
    .find((msg) => msg.sender_id === currentUserId);

  if (!lastOwn) {
    return "";
  }

  if (!otherLastReadAt) {
    return "Sent";
  }

  const lastReadTime = new Date(otherLastReadAt).getTime();
  const lastOwnTime = new Date(lastOwn.created_at).getTime();
  return lastReadTime >= lastOwnTime ? "Read" : "Sent";
}

type Props = {
  conversationId: string;
  currentUserId: string;
  initialMessages: RawMessage[];
  chatName: string;
  initialUnreadCount: number;
  otherLastReadAt: string | null;
  isGroup: boolean;
};

export default function ChatMessages({
  conversationId,
  currentUserId,
  initialMessages,
  chatName,
  initialUnreadCount,
  otherLastReadAt,
  isGroup,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(() => initialMessages.map(normalizeMessage));
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Subscribe to new messages
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f43f4436-0bd4-44e2-859b-c9a5c45048f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/app/messages/[id]/chat-messages.tsx:subscribe:start',message:'subscribe start',data:{conversationId},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion

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
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/f43f4436-0bd4-44e2-859b-c9a5c45048f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/app/messages/[id]/chat-messages.tsx:subscribe:payload',message:'received payload',data:{conversationId,payloadId:payload?.new?.id ?? null},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H2'})}).catch(()=>{});
          // #endregion

          // Fetch the complete message with sender info
          const { data: newMsg } = await supabase
            .from("messages")
            .select("id, content, created_at, sender_id, profiles(username, display_name)")
            .eq("id", payload.new.id)
            .single();

          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/f43f4436-0bd4-44e2-859b-c9a5c45048f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/app/messages/[id]/chat-messages.tsx:subscribe:fetch',message:'fetched message after payload',data:{conversationId,found:!!newMsg,fromSender:newMsg?.sender_id ?? null,currentUserId},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H3'})}).catch(()=>{});
          // #endregion

          if (newMsg) {
            setMessages((prev) => {
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/f43f4436-0bd4-44e2-859b-c9a5c45048f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/app/messages/[id]/chat-messages.tsx:subscribe:setMessages',message:'appending message',data:{conversationId,prevCount:prev.length,nextCount:prev.length + 1,newMsgId:newMsg.id},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H4'})}).catch(()=>{});
              // #endregion
              return [...prev, normalizeMessage(newMsg as RawMessage)];
            });
          }
        }
      )
      .subscribe((status) => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/f43f4436-0bd4-44e2-859b-c9a5c45048f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/app/messages/[id]/chat-messages.tsx:subscribe:status',message:'channel status',data:{conversationId,status},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
      });

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f43f4436-0bd4-44e2-859b-c9a5c45048f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/app/messages/[id]/chat-messages.tsx:subscribe:created',message:'channel subscribed',data:{conversationId},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion

    return () => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/f43f4436-0bd4-44e2-859b-c9a5c45048f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/app/messages/[id]/chat-messages.tsx:subscribe:cleanup',message:'channel cleanup',data:{conversationId},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H4'})}).catch(()=>{});
      // #endregion
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  // Mark as read when chat opens
  useEffect(() => {
    const markRead = async () => {
      setUnreadCount(0);
    };

    markRead();
  }, [conversationId, currentUserId, supabase]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f43f4436-0bd4-44e2-859b-c9a5c45048f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/app/messages/[id]/chat-messages.tsx:handleSend:start',message:'send start',data:{conversationId,messageLength:newMessage.trim().length,sendingFlag:sending},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: newMessage.trim(),
    });

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f43f4436-0bd4-44e2-859b-c9a5c45048f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/app/messages/[id]/chat-messages.tsx:handleSend:afterInsert',message:'send insert result',data:{conversationId,insertErrorMessage:error?.message ?? null,insertErrorCode:error?.code ?? null},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H3'})}).catch(()=>{});
    // #endregion

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
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount} unread
            </span>
          )}
          {!isGroup && (
            <span className="text-xs text-zinc-400">
              {getReadLabel(messages, currentUserId, otherLastReadAt)}
            </span>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isOwn = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
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
