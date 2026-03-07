import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { generateAlias } from '../lib/ai';

export default function Login() {
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    setLoading(true);
    try {
      // Create an anonymous guest user using anonymous signin (requires Supabase anonymous auth enabled)
      const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
      
      if (authError) throw authError;

      if (authData.user) {
        // Generate alias
        const alias = await generateAlias();
        
        // Save profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ id: authData.user.id, alias }]);
          
        if (profileError) throw profileError;
      }
    } catch (err) {
      console.error('Error joining:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-200">
      <div className="glass-panel w-full max-w-sm rounded-3xl p-8 flex flex-col items-center gap-8 shadow-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-widest mb-2">KARDS</h1>
          <p className="text-gray-500 font-medium tracking-wide">Anonymous, topic-based discussions.</p>
        </div>
        
        <button 
          onClick={handleJoin}
          disabled={loading}
          className="w-full bg-black text-white rounded-2xl py-4 font-bold shadow-xl hover:scale-[1.02] active:scale-95 transition-all outline-none disabled:opacity-50"
        >
          {loading ? 'Joining...' : 'Join Anonymously'}
        </button>
      </div>
    </div>
  );
}
