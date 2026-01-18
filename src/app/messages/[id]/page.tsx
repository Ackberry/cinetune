import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import ChatMessages from "./chat-messages";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ChatPage({ params }: Props) {
  const { id: conversationId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verify user is part of this conversation
  const { data: participant } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
    .single();

  if (!participant) {
    notFound();
  }

  // Get conversation details
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, is_group, name")
    .eq("id", conversationId)
    .single();

  // Get other participant for DMs
  const { data: otherParticipant } = await supabase
    .from("conversation_participants")
    .select("profiles(username, display_name, avatar_url)")
    .eq("conversation_id", conversationId)
    .neq("user_id", user.id)
    .single();

  // Get initial messages
  const { data: messages } = await supabase
    .from("messages")
    .select("id, content, created_at, sender_id, profiles(username, display_name)")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(50);

  // Handle profiles being returned as array or object
  const otherProfile = Array.isArray(otherParticipant?.profiles)
    ? otherParticipant.profiles[0]
    : otherParticipant?.profiles;

  const chatName = conversation?.is_group
    ? conversation.name || "Group"
    : otherProfile?.display_name || otherProfile?.username || "Chat";
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <ChatMessages
        conversationId={conversationId}
        currentUserId={user.id}
        initialMessages={(messages || []) as Parameters<typeof ChatMessages>[0]["initialMessages"]}
        chatName={chatName}
      />
    </div>
  );
}
