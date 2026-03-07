import { useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import ChatBubble from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';
import { useChat } from '../hooks/useChat';

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement>(null);
  
  const { messages, loading, sendMessage } = useChat(id as string);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text: string) => {
    await sendMessage(text);
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-50/50">
      {/* Top Bar */}
      <div className="flex items-center px-4 py-3 bg-white/80 backdrop-blur-md border-b border-gray-100 z-10 sticky top-0 shadow-sm">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <span className="font-bold text-lg text-center flex-1 pr-10">Group Chat</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
        {loading && messages.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-gray-400">Loading chat...</div>
        ) : (
          messages.map((msg) => (
            <ChatBubble key={msg.id} msg={msg} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 pb-safe">
        <ChatInput onSend={handleSend} disabled={loading} />
      </div>
    </div>
  );
}
