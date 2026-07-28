import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ChatIcon from './ChatIcon';
import ChatWindow from './ChatWindow';
import type { ChatMessage } from '../../types/chat';

const STUDENT_NAME = 'Aditya'; // replace with real logged-in student name later

function makeMessage(sender: 'ai' | 'user', text: string): ChatMessage {
  return { id: crypto.randomUUID(), sender, text, timestamp: Date.now() };
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Initial AI messages on page load
  useEffect(() => {
    const initialMessages: ChatMessage[] = [
      makeMessage('ai', `Hi ${STUDENT_NAME}!`),
      makeMessage(
        'ai',
        `You have a few tasks to complete:\n1) Complete the quiz\n2) Finish the course\n3) Review your last assignment feedback`
      ),
    ];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessages(initialMessages);
    setUnreadCount(initialMessages.length);

    toast('You have new messages! Check the chat icon', {
      duration: 4000,
      position: 'top-right',
    });
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  const handleSend = async (text: string) => {
  const userMsg = makeMessage('user', text);
  setMessages((prev) => [...prev, userMsg]);
  setIsLoading(true);

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }

    const aiMsg = makeMessage('ai', data.reply);
    setMessages((prev) => [...prev, aiMsg]);
  } catch (err) {
    const errorMsg = makeMessage(
      'ai',
      "Sorry, I'm having trouble connecting right now. Please try again in a moment."
    );
    setMessages((prev) => [...prev, errorMsg]);
    console.error('Chat error:', err);
  } finally {
    setIsLoading(false);
  }
};
  

  return (
    <>
      {!isOpen && <ChatIcon unreadCount={unreadCount} onClick={handleOpen} />}
      {isOpen && (
        <ChatWindow
          messages={messages}
          onSend={handleSend}
          onClose={() => setIsOpen(false)}
          isLoading={isLoading}
        />
      )}
    </>
  );
}