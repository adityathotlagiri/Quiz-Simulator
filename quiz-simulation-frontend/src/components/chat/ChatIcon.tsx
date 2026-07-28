interface ChatIconProps {
  unreadCount: number;
  onClick: () => void;
}

export default function ChatIcon({ unreadCount, onClick }: ChatIconProps) {
  return (
    <div className="fixed bottom-6 right-6 flex items-center justify-end z-50 group">
      
      <div className="absolute right-16 mr-2 bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap opacity-0 scale-95 translate-x-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none">
        Chat with AI tutor
        <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
      </div>

      <button
        onClick={onClick}
        className="w-14 h-14 rounded-full bg-indigo-500  text-white 
                   shadow-lg flex items-center justify-center hover:scale-105 
                   transition-transform duration-200"
        aria-label="Open AI Tutor Chat"
      >
        <svg
          xmlns="http://w3.org"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="w-7 h-7"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8-1.284 0-2.503-.24-3.605-.671L3 21l1.671-4.395C3.6 15.503 3 13.803 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs 
                            font-semibold w-5 h-5 rounded-full flex items-center 
                            justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

    </div>
  );
}
