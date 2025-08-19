import React, { useEffect, useRef } from 'react';
import { format, isSameDay, isToday, isYesterday, differenceInMinutes } from 'date-fns';
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

  // Helpers for timestamps and headers
  const CLUSTER_MINUTES = 5;
  const formatDayHeader = (d: Date) => {
    if (isToday(d)) return 'Today';
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'EEE, MMM d');
  };

  const formatMsgTime = (d: Date) => format(d, 'p'); // locale-aware time like 6:02 PM

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white/40 dark:bg-slate-900/40">
      {messages.map((msg, index) => {
        const isMine = msg.sender_id === currentUserId;
        const curDate = new Date(msg.created_at);
        const prev = index > 0 ? messages[index - 1] : undefined;
        const next = index < messages.length - 1 ? messages[index + 1] : undefined;

        // Date header logic
        const showDateHeader = !prev || !isSameDay(new Date(prev.created_at), curDate);

        // Cluster logic (same sender within N minutes)
        const inSameClusterAsPrev = !!prev && prev.sender_id === msg.sender_id &&
          Math.abs(differenceInMinutes(curDate, new Date(prev.created_at))) < CLUSTER_MINUTES;

        const inSameClusterAsNext = !!next && next.sender_id === msg.sender_id &&
          Math.abs(differenceInMinutes(new Date(next.created_at), curDate)) < CLUSTER_MINUTES;

        const isLastInCluster = !inSameClusterAsNext;
        const isLastMessage = index === messages.length - 1;

        // Compose meta line
        const metaPieces: string[] = [];
        if (isLastInCluster || isLastMessage) {
          metaPieces.push(formatMsgTime(curDate));
          if (isMine && msg.read_at) metaPieces.push('Read');
        }

        return (
          <React.Fragment key={msg.id}>
            {showDateHeader && (
              <div className="w-full flex justify-center my-2">
                <div className="text-xs px-2 py-1 rounded-full bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                  {formatDayHeader(curDate)}
                </div>
              </div>
            )}
            <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  isMine
                    ? 'bg-nil-orange text-white rounded-br-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-sm border border-slate-200 dark:border-slate-700'
                }`}
                title={new Date(msg.created_at).toLocaleString()}
                aria-label={`Sent at ${new Date(msg.created_at).toISOString()}`}
              >
                <div className="whitespace-pre-wrap break-words">{renderMessageText(msg.content)}</div>
                {(metaPieces.length > 0) && (
                  <div className={`mt-1 text-[10px] opacity-75 ${isMine ? 'text-white/90' : 'text-slate-500 dark:text-slate-400'}`}>
                    {metaPieces.join(' • ')}
                  </div>
                )}
              </div>
            </div>
          </React.Fragment>
        );
      })}
      <div ref={endRef} />
    </div>
  );
};

export default MessageList;
