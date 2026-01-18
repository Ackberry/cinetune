import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

type Conversation = {
  id: string;
  is_group: boolean;
  name: string | null;
  other_user: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  last_message: {
    content: string;
    created_at: string;
  } | null;
};

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get all conversations for this user
  const { data: participations } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", user.id);

  if (!participations || participations.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Messages</h1>
            <Link href="/messages/new-group" className="bg-zinc-800 px-4 py-2 rounded-lg hover:bg-zinc-700">
              New Group
            </Link>
          </div>
          <p className="text-zinc-500">No conversations yet</p>
        </div>
      </div>
    );
  }

  const conversationIds = participations.map((p) => p.conversation_id);

  // Get conversation details
  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, is_group, name")
    .in("id", conversationIds);

  // Get other participants for each conversation
  const { data: allParticipants } = await supabase
    .from("conversation_participants")
    .select("conversation_id, user_id, profiles(username, display_name, avatar_url)")
    .in("conversation_id", conversationIds)
    .neq("user_id", user.id);

  // Get last message for each conversation
  const { data: lastMessages } = await supabase
    .from("messages")
    .select("conversation_id, content, created_at")
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: false });

  // Build conversation list with all data
  const conversationList: Conversation[] = (conversations || []).map((conv) => {
    const otherParticipant = allParticipants?.find(
      (p) => p.conversation_id === conv.id
    );
    const lastMsg = lastMessages?.find((m) => m.conversation_id === conv.id);

    // Handle profiles being returned as array or object
    const profiles = otherParticipant?.profiles;
    const otherUser = Array.isArray(profiles) ? profiles[0] : profiles;

    return {
      id: conv.id,
      is_group: conv.is_group,
      name: conv.name,
      other_user: (otherUser ?? null) as Conversation["other_user"],
      last_message: lastMsg ? { content: lastMsg.content, created_at: lastMsg.created_at } : null,
    };
  });

  // Sort by last message time
  conversationList.sort((a, b) => {
    if (!a.last_message) return 1;
    if (!b.last_message) return -1;
    return new Date(b.last_message.created_at).getTime() - new Date(a.last_message.created_at).getTime();
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Messages</h1>
          <Link href="/messages/new-group" className="bg-zinc-800 px-4 py-2 rounded-lg hover:bg-zinc-700">
            New Group
          </Link>
        </div>

        <div className="space-y-2">
          {conversationList.map((conv) => (
            <Link
              key={conv.id}
              href={`/messages/${conv.id}`}
              className="flex items-center gap-4 bg-zinc-900 rounded-lg p-4 hover:bg-zinc-800 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center text-lg">
                {conv.is_group
                  ? "👥"
                  : (conv.other_user?.display_name || conv.other_user?.username || "?")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium">
                  {conv.is_group
                    ? conv.name || "Group"
                    : conv.other_user?.display_name || conv.other_user?.username || "Unknown"}
                </h3>
                {conv.last_message && (
                  <p className="text-sm text-zinc-400 truncate">{conv.last_message.content}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
