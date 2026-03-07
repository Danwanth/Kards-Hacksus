import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Kard } from '../components/KardCard';

export default function KardView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [kard, setKard] = useState<Kard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKard = async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase.from('kards').select('*').eq('id', id).single();
      if (!error && data) {
        setKard(data);
      }
      setLoading(false);
    };
    fetchKard();
  }, [id]);

  if (loading) {
    return <div className="w-full h-full flex items-center justify-center">Loading Kard...</div>;
  }

  if (!kard) {
    return <div className="w-full h-full flex items-center justify-center">Kard not found.</div>;
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-200">
      <div className="glass-panel w-full max-w-sm rounded-[2rem] p-8 flex flex-col gap-6 items-center flex-1 max-h-[70vh] shadow-2xl">
        <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">{kard.title}</h2>
        <p className="text-gray-600 text-center text-lg flex-1 overflow-y-auto leading-relaxed">
          {kard.summary}
        </p>
        
        <div className="w-full flex flex-col gap-3 mt-auto">
          <button 
            onClick={() => navigate(`/kard/${id}/chat`)}
            className="w-full bg-black text-white rounded-2xl py-4 font-semibold hover:scale-[1.02] active:scale-95 transition-all shadow-lg outline-none"
          >
            Enter Chat
          </button>
          <button 
            onClick={() => navigate(-1)}
            className="w-full bg-white/50 text-black border border-black/10 rounded-2xl py-4 font-semibold hover:bg-white/80 active:scale-95 transition-all outline-none"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
