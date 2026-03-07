
import { motion, useAnimation } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export interface Kard {
  id: string;
  title: string;
  summary: string;
}

interface KardCardProps {
  kard: Kard;
  index: number;
  onRemove: () => void;
  isFront: boolean;
}

export default function KardCard({ kard, index, onRemove, isFront }: KardCardProps) {
  const navigate = useNavigate();
  const controls = useAnimation();

  const handleDragEnd = async (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Swipe threshold to trigger removal
    const swipeThreshold = 100;
    if (Math.abs(info.offset.x) > swipeThreshold) {
      const exitDir = info.offset.x > 0 ? 500 : -500;
      await controls.start({
        x: exitDir,
        opacity: 0,
        transition: { duration: 0.3 }
      });
      onRemove();
    } else {
      // Return to center
      controls.start({ x: 0, y: 0, rotate: 0 });
    }
  };

  const handleTap = () => {
    if (isFront) {
      navigate(`/kard/${kard.id}`);
    }
  };

  // Stack styling based on index
  const scale = 1 - index * 0.05;
  const yOffset = index * 20;
  
  return (
    <motion.div
      className={`absolute w-full max-w-sm aspect-[3/4] rounded-[2rem] p-8 flex flex-col items-center justify-center cursor-pointer glass-panel ${isFront ? 'shadow-2xl z-10' : 'shadow-md shadow-black/5 z-0'}`}
      style={{
        transformOrigin: 'bottom center',
        backgroundColor: 'rgba(255,255,255,0.95)'
      }}
      initial={{ scale: 0.9, y: 50, opacity: 0 }}
      animate={controls}
      whileInView={{
        scale,
        y: yOffset,
        opacity: 1 - index * 0.2,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      drag={isFront ? 'x' : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
      whileTap={{ scale: isFront ? 0.98 : scale }}
      whileHover={{ y: isFront ? -5 : yOffset, rotate: isFront ? (Math.random() > 0.5 ? 2 : -2) : 0 }}
      onClick={handleTap}
    >
      <div className="flex-1 flex w-full">
        {/* Empty space to push content to middle/bottom if desired */}
      </div>
      
      <div className="flex-1 flex flex-col justify-end w-full pb-4">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-3 line-clamp-2">
          {kard.title}
        </h3>
        <p className="text-gray-600 font-medium leading-relaxed line-clamp-4">
          {kard.summary}
        </p>
      </div>

      <div className="w-full flex justify-between items-center pt-6 border-t border-gray-100">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          {isFront ? 'Swipe to Skip' : 'Next'}
        </span>
        <span className="text-xs font-bold text-black uppercase tracking-widest flex items-center gap-1">
          Tap to Join <span className="opacity-50">→</span>
        </span>
      </div>
    </motion.div>
  );
}
