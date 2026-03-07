import { useEffect } from 'react';
import { supabase } from './supabase';
import { generateKardSummary } from './ai';

export function useKardSummarizer() {
  useEffect(() => {
    // In a real production app, this should be a backend CRON job.
    // For this prototype, we'll run it every 2 minutes from the client.
    const interval = setInterval(async () => {
      console.log('Running background summarization check...');
      
      const { data: kards } = await supabase.from('kards').select('id, title, summary');
      if (!kards) return;

      for (const kard of kards) {
        // Fetch last 20 messages for this kard
        const { data: messages } = await supabase
          .from('messages')
          .select('alias, message')
          .eq('kard_id', kard.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (messages && messages.length > 0) {
          const chatText = messages
            .reverse()
            .map((m: any) => `${m.alias}: ${m.message}`)
            .join('\n');

          const newSummary = await generateKardSummary(chatText);
          
          if (newSummary && newSummary !== kard.summary) {
            await supabase
              .from('kards')
              .update({ summary: newSummary })
              .eq('id', kard.id);
          }
        }
      }
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(interval);
  }, []);
}
