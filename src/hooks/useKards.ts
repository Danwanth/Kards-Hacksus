import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Kard } from '../components/KardCard';

export function useKards() {
  const [kards, setKards] = useState<Kard[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchKards = async () => {
    try {
      setLoading(true);
      // Fetch 3 random active kards (using sample for postgres random)
      const { data, error } = await supabase
        .from('kards')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      
      // Shuffle locally for "randomness" in UI
      const shuffled = (data || []).sort(() => 0.5 - Math.random()).slice(0, 3);
      setKards(shuffled as Kard[]);
      
    } catch (err) {
      console.error('Error fetching kards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKards();
  }, []);

  return { kards, loading, refetch: fetchKards };
}
