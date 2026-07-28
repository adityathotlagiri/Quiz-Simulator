import { useRef, useEffect, useState } from 'react';
import { type ChatMessage as ChatMessageType } from '../../types/chat';
import ChatMessage from './ChatMessage';

interface ChatWindowProps {
  messages: ChatMessageType[];
  onSend: (text: string) => void;
  onClose: () => void;
  isLoading: boolean;
}

export default function ChatWindow({ messages, onSend, onClose, isLoading }: ChatWindowProps) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <div className="fixed bottom-24 right-6 w-[360px] h-[500px] bg-white rounded-2xl 
                     shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-indigo-500 text-white px-4 py-3 flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">AI Tutor</p>
          <p className="text-xs text-white/80">Ask me anything</p>
        </div>
        <button onClick={onClose} className="text-white/90 hover:text-white text-xl leading-none">
          &times;
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start mb-3">
            <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-2xl text-sm rounded-tl-sm">
              typing...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm 
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="bg-indigo-500 text-white rounded-full px-4 py-2 text-sm 
                     hover:bg-indigo-700 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}