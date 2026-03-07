import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import KardCard from '../components/KardCard';
import type { Kard } from '../components/KardCard';
import { useKards } from '../hooks/useKards';

export default function Home() {
  const { kards: fetchedKards, loading, refetch } = useKards();
  const [kards, setKards] = useState<Kard[]>([]);

  useEffect(() => {
    if (!loading && fetchedKards.length > 0) {
      setKards(fetchedKards);
    }
  }, [fetchedKards, loading]);

  const handleRemove = (idToRemove: string) => {
    setKards(prev => prev.filter(kard => kard.id !== idToRemove));
    
    if (kards.length <= 1) {
      refetch();
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-200">
      <div className="relative w-full max-w-sm aspect-[3/4] flex items-center justify-center mt-12">
        <AnimatePresence>
          {kards.map((kard, index) => (
            <KardCard
              key={kard.id}
              kard={kard}
              index={index}
              isFront={index === 0}
              onRemove={() => handleRemove(kard.id)}
            />
          ))}
        </AnimatePresence>
        
        {(kards.length === 0 || loading) && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium z-[-1] animate-pulse">
            {loading ? "Loading Kards..." : "No Kards available."}
          </div>
        )}
      </div>
    </div>
  );
}
