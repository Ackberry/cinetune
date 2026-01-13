"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  targetUserId: string;
};

export default function MessageButton({ targetUserId }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleMessage = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    if (user.id === targetUserId) {
      alert("You can't message yourself");
      setLoading(false);
      return;
    }

    // Check if conversation already exists between these users
    const { data: myConversations } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id);

    const { data: theirConversations } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", targetUserId);

    // Find common conversation (DM)
    const myIds = myConversations?.map((c) => c.conversation_id) || [];
    const theirIds = theirConversations?.map((c) => c.conversation_id) || [];
    const commonId = myIds.find((id) => theirIds.includes(id));

    if (commonId) {
      // Existing conversation found
      router.push(`/messages/${commonId}`);
      return;
    }

    // Create new conversation with client-generated ID
    const conversationId = crypto.randomUUID();

    const { error: convError } = await supabase
      .from("conversations")
      .insert({ id: conversationId, is_group: false });

    if (convError) {
      alert("Failed to create conversation");
      setLoading(false);
      return;
    }

    // Add both participants
    const { error: participantError } = await supabase.from("conversation_participants").insert([
      { conversation_id: conversationId, user_id: user.id },
      { conversation_id: conversationId, user_id: targetUserId },
    ]);

    if (participantError) {
      console.error("Failed to add participants:", participantError);
      // Rollback: delete the conversation we just created
      await supabase.from("conversations").delete().eq("id", conversationId);
      alert("Failed to start conversation. Please try again.");
      setLoading(false);
      return;
    }

    router.push(`/messages/${conversationId}`);
  };

  return (
    <button
      onClick={handleMessage}
      disabled={loading}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-500 disabled:opacity-50"
    >
      {loading ? "..." : "Message"}
    </button>
  );
}
