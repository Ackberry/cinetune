"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
};

export default function NewGroupPage() {
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Profile[]>([]);
  const [creating, setCreating] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setCurrentUserId(user.id);
      }
    }
    checkAuth();
  }, [supabase, router]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    const { data } = await supabase
      .from("profiles")
      .select("id, username, display_name")
      .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
      .neq("id", currentUserId)
      .limit(10);

    setSearchResults(data || []);
  };

  const toggleUser = (user: Profile) => {
    if (selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedUsers.length < 1 || !currentUserId) return;

    setCreating(true);

    // Generate UUID client-side to avoid RLS SELECT issue
    const conversationId = crypto.randomUUID();

    const { error: convError } = await supabase
      .from("conversations")
      .insert({ id: conversationId, is_group: true, name: groupName.trim() });

    if (convError) {
      console.error("Conversation error:", convError);
      alert("Failed to create group");
      setCreating(false);
      return;
    }

    // Add all participants including current user
    const participants = [
      { conversation_id: conversationId, user_id: currentUserId },
      ...selectedUsers.map((u) => ({
        conversation_id: conversationId,
        user_id: u.id,
      })),
    ];

    const { error: partError } = await supabase.from("conversation_participants").insert(participants);

    if (partError) {
      console.error("Participants error:", partError);
      // Rollback: delete the conversation we just created
      await supabase.from("conversations").delete().eq("id", conversationId);
      alert("Failed to add members. Please try again.");
      setCreating(false);
      return;
    }

    router.push(`/messages/${conversationId}`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8">New Group</h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Group Name</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="My Group"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 focus:outline-none focus:border-zinc-600"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Add Members</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by username..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 focus:outline-none focus:border-zinc-600"
              />
              <button
                onClick={handleSearch}
                className="bg-zinc-800 px-4 py-3 rounded-lg hover:bg-zinc-700"
              >
                Search
              </button>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((user) => {
                const isSelected = selectedUsers.find((u) => u.id === user.id);
                return (
                  <button
                    key={user.id}
                    onClick={() => toggleUser(user)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isSelected ? "bg-blue-600" : "bg-zinc-900 hover:bg-zinc-800"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
                      {(user.display_name || user.username || "?")[0].toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{user.display_name || user.username}</p>
                      {user.username && <p className="text-sm text-zinc-400">@{user.username}</p>}
                    </div>
                    {isSelected && <span className="ml-auto">✓</span>}
                  </button>
                );
              })}
            </div>
          )}

          {selectedUsers.length > 0 && (
            <div>
              <p className="text-sm text-zinc-400 mb-2">Selected ({selectedUsers.length}):</p>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <span
                    key={user.id}
                    className="bg-zinc-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {user.display_name || user.username}
                    <button
                      onClick={() => toggleUser(user)}
                      className="text-zinc-400 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={creating || !groupName.trim() || selectedUsers.length < 1}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-500 disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
}
