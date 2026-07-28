import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { type ChatMessage as ChatMessageType } from '../../types/chat';

export default function ChatMessage({ message }: { message: ChatMessageType }) {
  const isAI = message.sender === 'ai';

  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}>
      <div
        className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${
          isAI
            ? 'bg-gray-100 text-gray-800 rounded-tl-sm'
            : 'bg-indigo-500 text-white rounded-tr-sm'
        }`}
      >
        {isAI ? (
          <div className="prose prose-sm max-w-none leading-relaxed prose-p:my-2 prose-ul:my-1 prose-ol:my-1 prose-table:my-2">
            <ReactMarkdown
              remarkPlugins={[remarkMath, remarkGfm]}
              rehypePlugins={[rehypeKatex]}
            >
              {message.text}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="whitespace-pre-line">{message.text}</p>
        )}
      </div>
    </div>
  );
}