import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Message } from '../components/ChatBubble';
import { useAuth } from './useAuth';
import { suggestDenselMessage } from '../lib/ai';

export function useChat(kardId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!kardId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('kard_id', kardId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else if (data) {
        setMessages(
          data.map((m: any) => ({
            id: m.id,
            alias: m.alias,
            message: m.message,
            is_ai: m.is_ai,
            isMine: m.user_id === user?.id,
            created_at: m.created_at
          }))
        );
      }
      setLoading(false);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat_${kardId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `kard_id=eq.${kardId}`
        },
        (payload) => {
          const newMsg = payload.new;
          setMessages((prev) => [
            ...prev,
            {
              id: newMsg.id,
              alias: newMsg.alias,
              message: newMsg.message,
              is_ai: newMsg.is_ai,
              isMine: newMsg.user_id === user?.id,
              created_at: newMsg.created_at
            }
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [kardId, user?.id]);

  const sendMessage = async (text: string) => {
    if (!user || !text.trim()) return;

    // Insert user message
    const { error } = await supabase.from('messages').insert({
      kard_id: kardId,
      user_id: user.id,
      alias: user.alias,
      message: text.trim(),
      is_ai: false
    });

    if (error) {
      console.error('Send error:', error);
    }
    
    triggerDensel(text);
  };

  // Very basic Densel trigger logic (could be moved to edge function)
  const triggerDensel = async (latestMessage: string) => {
    if (Math.random() > 0.3) return; // Only trigger Densel sometimes

    // get last 5 messages context
    const contextLines = messages.slice(-5).map(m => `${m.alias}: ${m.message}`);
    contextLines.push(`${user?.alias}: ${latestMessage}`);
    const context = contextLines.join('\n');
    
    const denselSuggestion = await suggestDenselMessage(context);
    
    if (denselSuggestion) {
      await supabase.from('messages').insert({
        kard_id: kardId,
        user_id: null,
        alias: 'Densel',
        message: denselSuggestion,
        is_ai: true
      });
    }
  };

  return { messages, loading, sendMessage };
}
