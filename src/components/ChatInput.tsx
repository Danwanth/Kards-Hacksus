import { useState } from 'react';
import { SendIcon } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 flex items-center gap-3 w-full"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type message..."
        disabled={disabled}
        className="flex-1 bg-gray-100/50 border-transparent focus:bg-white focus:border-gray-200 outline-none rounded-full px-5 py-3 text-sm transition-all shadow-inner"
      />
      
      <button
        type="submit"
        disabled={!text.trim() || disabled}
        className="bg-black text-white p-3 rounded-full flex items-center justify-center disabled:opacity-50 hover:scale-105 active:scale-95 transition-all shadow-md"
      >
        <SendIcon size={18} />
      </button>
    </form>
  );
}
