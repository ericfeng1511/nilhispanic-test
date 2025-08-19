import React, { useEffect, useRef, useState } from 'react';
import { format, isSameDay, isToday, isYesterday, differenceInMinutes } from 'date-fns';
import type { Message } from '@/types/chat';
import { User } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  avatars?: Record<string, string | undefined>; // map of sender_id -> avatar URL
}

// Small helper to render an avatar with image fallback to a gradient placeholder (matches admin dashboard style)
const AvatarBubble: React.FC<{ src?: string; nameKey: string }> = ({ src, nameKey }) => {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-nil-light-blue to-nil-navy">
        <User className="w-4 h-4 text-white opacity-60" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt="avatar"
      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
      onError={() => setErrored(true)}
    />
  );
};

export const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId, avatars }) => {
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
          className="underline underline-offset-2 hover:opacity-80 break-words text-blue-200 hover:text-blue-100"
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
    <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-gray-50">
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
              <div className="w-full flex justify-center my-4">
                <div className="text-xs px-3 py-1.5 rounded-full bg-white text-gray-600 shadow-sm border border-gray-200 font-medium">
                  {formatDayHeader(curDate)}
                </div>
              </div>
            )}
            <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1`}>
              <div className={`flex items-end gap-2 max-w-[75%] ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isMine && !inSameClusterAsPrev && (
                  <AvatarBubble src={avatars?.[msg.sender_id]} nameKey={msg.sender_id} />
                )}
                {!isMine && inSameClusterAsPrev && (
                  <div className="w-8 h-8 flex-shrink-0"></div>
                )}
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm relative ${
                    isMine
                      ? 'bg-nil-orange text-white rounded-br-md'
                      : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
                  }`}
                  title={new Date(msg.created_at).toLocaleString()}
                  aria-label={`Sent at ${new Date(msg.created_at).toISOString()}`}
                >
                  <div className="whitespace-pre-wrap break-words leading-relaxed">{renderMessageText(msg.content)}</div>
                  {(metaPieces.length > 0) && (
                    <div className={`mt-1.5 text-[10px] opacity-75 ${isMine ? 'text-white/90' : 'text-gray-500'}`}>
                      {metaPieces.join(' • ')}
                    </div>
                  )}
                </div>
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
