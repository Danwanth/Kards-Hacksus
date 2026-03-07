import clsx from 'clsx';
import { motion } from 'framer-motion';

export interface Message {
  id: string;
  alias: string;
  message: string;
  is_ai: boolean;
  isMine: boolean;
  created_at: string;
}

interface ChatBubbleProps {
  msg: Message;
}

export default function ChatBubble({ msg }: ChatBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={clsx(
        "flex w-full mb-4",
        msg.isMine ? "justify-end" : "justify-start"
      )}
    >
      <div 
        className={clsx(
          "max-w-[75%] px-4 py-3 rounded-2xl shadow-sm",
          msg.isMine 
            ? "bg-black text-white rounded-br-sm" 
            : msg.is_ai 
              ? "bg-indigo-50 border border-indigo-100/50 text-indigo-950 rounded-bl-sm" 
              : "bg-white border border-gray-100 text-gray-900 rounded-bl-sm"
        )}
      >
        {!msg.isMine && (
          <div className="text-xs font-bold tracking-wide mb-1 opacity-70 flex items-center gap-1">
            {msg.is_ai ? '🤖 Densel' : msg.alias}
          </div>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap word-break-words">
          {msg.message}
        </p>
      </div>
    </motion.div>
  );
}
