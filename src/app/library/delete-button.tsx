"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteButton({ id }: { id: string }) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    if (!confirm("Remove from library?")) return;

    setDeleting(true);
    await supabase.from("user_media").delete().eq("id", id);
    router.refresh();
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
      title="Remove from library"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}
