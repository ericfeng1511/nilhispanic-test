import React, { useEffect, useRef } from 'react';
import type { Message } from '@/types/chat';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId }) => {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Safely render message text with clickable links. Does not allow HTML injection.
  const renderMessageText = (text: string) => {
    const parts: React.ReactNode[] = [];
    const urlRegex = /((https?:\/\/[^\s]+)|(www\.[^\s]+))/gi;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = urlRegex.exec(text)) !== null) {
      const [raw] = match;
      const start = match.index;
      const end = start + raw.length;
      if (start > lastIndex) {
        parts.push(text.slice(lastIndex, start));
      }
      // Normalize href to include protocol
      const href = raw.startsWith('http') ? raw : `http://${raw}`;
      parts.push(
        <a
          key={`${start}-${end}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:opacity-80 break-words"
          onClick={(e) => e.stopPropagation()}
        >
          {raw}
        </a>
      );
      lastIndex = end;
    }
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    return parts;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white/40 dark:bg-slate-900/40">
      {messages.map((msg) => {
        const isMine = msg.sender_id === currentUserId;
        return (
          <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                isMine
                  ? 'bg-nil-orange text-white rounded-br-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-sm border border-slate-200 dark:border-slate-700'
              }`}
              title={new Date(msg.created_at).toLocaleString()}
            >
              <div className="whitespace-pre-wrap break-words">{renderMessageText(msg.content)}</div>
              {msg.read_at && isMine && (
                <div className="mt-1 text-[10px] opacity-70">Read</div>
              )}
            </div>
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
};

export default MessageList;
