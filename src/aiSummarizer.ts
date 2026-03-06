import { supabase } from "./supabase";

export async function summarizeGroup(groupId: number) {

  // 1. get recent messages
  const { data: messages } = await supabase
    .from("messages")
    .select("content")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (!messages || messages.length === 0) return;

  const text = messages.map(m => m.content).join("\n");

  // 2. call AI API (placeholder for now)
  const summary = text.slice(0,120);

  // 3. update kard summary
  await supabase
    .from("kard_summaries")
    .update({ summary })
    .eq("group_id", groupId);

}