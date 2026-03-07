import { supabase } from "./supabase";
import { summarizeConversation } from "./ai";

export async function runSummarizer() {

  try {

    // get all active group ids
    const { data: groups, error: groupError } = await supabase
      .from("messages")
      .select("group_id")
      .order("group_id");

    if (groupError || !groups) {
      console.log("Group fetch error:", groupError);
      return;
    }

    const uniqueGroups = [...new Set(groups.map(g => g.group_id))];

    for (const groupId of uniqueGroups) {

      // get last messages
      const { data: messages, error } = await supabase
        .from("messages")
        .select("content")
        .eq("group_id", groupId)
        .order("created_at", { ascending: true })
        .limit(50);

      if (error || !messages || messages.length === 0) {
        continue;
      }

      const messageTexts = messages.map(m => m.content);

      const summary = await summarizeConversation(messageTexts);

      console.log("New summary:", summary);

      // update kard summary
      await supabase
        .from("kard_summaries")
        .upsert({
          group_id: groupId,
          summary: summary
        });

    }

  } catch (err) {

    console.error("Summarizer crash:", err);

  }

}