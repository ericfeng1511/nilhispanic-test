import React, { useEffect, useRef, useState } from 'react';
import { format, isSameDay, isToday, isYesterday, differenceInMinutes } from 'date-fns';
import type { Message } from '@/types/chat';
import { User, Download } from 'lucide-react';
import { ChatService } from '@/services/chatService';

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

        // Determine if this bubble only contains image attachments (no text, no non-image files)
        const hasText = !!msg.content?.trim();
        const imagesCount = msg.attachments?.filter(a => a.mime_type.startsWith('image/')).length ?? 0;
        const totalAtts = msg.attachments?.length ?? 0;
        const imagesOnly = !hasText && imagesCount > 0 && imagesCount === totalAtts;

        return (
          <div className="contents" key={msg.id}>
            {showDateHeader && (
              <div className="w-full flex justify-center my-4">
                <div className="text-xs px-3 py-1.5 rounded-full bg-white text-gray-600 shadow-sm border border-gray-200 font-medium">
                  {formatDayHeader(curDate)}
                </div>
              </div>
            )}
            <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1`}>
              <div className={`${
                  imagesOnly
                    ? isMine
                      ? 'flex items-end w-full justify-end gap-0'
                      : 'flex items-end gap-2 max-w-[75%] flex-row'
                    : `flex items-end gap-2 max-w-[75%] ${isMine ? 'flex-row-reverse' : 'flex-row'}`
                }`}>
                {!isMine && !inSameClusterAsPrev && (
                  <AvatarBubble src={avatars?.[msg.sender_id]} nameKey={msg.sender_id} />
                )}
                {!isMine && inSameClusterAsPrev && (
                  <div className="w-8 h-8 flex-shrink-0"></div>
                )}
                <div
                  className={`${
                    imagesOnly
                      ? `p-0 text-sm relative ${isMine ? 'ml-auto' : 'mr-auto'}`
                      : `rounded-2xl px-4 py-2.5 text-sm shadow-sm relative ${
                          isMine
                            ? 'bg-nil-orange text-white rounded-br-md'
                            : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
                        }`
                  }`}
                  title={new Date(msg.created_at).toLocaleString()}
                  aria-label={`Sent at ${new Date(msg.created_at).toISOString()}`}
                >
                  {msg.content?.trim() && (
                    <div className="whitespace-pre-wrap break-words leading-relaxed">{renderMessageText(msg.content)}</div>
                  )}
                  {!!msg.attachments?.length && (
                    <div className={`${imagesOnly ? 'mt-0' : 'mt-2'} ${msg.content?.trim() ? '' : ''}`}>
                      <AttachmentGallery attachments={msg.attachments!} isMine={isMine} />
                    </div>
                  )}
                  {(metaPieces.length > 0) && (
                    <div className={`mt-1.5 text-[10px] opacity-75 ${isMine ? 'text-white/90' : 'text-gray-500'}`}>
                      {metaPieces.join(' • ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
};

// Renders a grid/list of attachments
const AttachmentGallery: React.FC<{ attachments: NonNullable<Message['attachments']>; isMine: boolean }>
  = ({ attachments, isMine }) => {
  const images = attachments.filter(a => a.mime_type.startsWith('image/'));
  const others = attachments.filter(a => !a.mime_type.startsWith('image/'));

  return (
    <div className="space-y-2">
      {images.length > 0 && (
        <div className={`grid ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-2 ${isMine ? 'justify-items-end' : 'justify-items-start'}`}>
          {images.map(att => (
            <AttachmentPreview key={att.id} attachment={att} isImage />
          ))}
        </div>
      )}
      {others.length > 0 && (
        <div className="flex flex-col gap-2">
          {others.map(att => (
            <AttachmentPreview key={att.id} attachment={att} />
          ))}
        </div>
      )}
    </div>
  );
};

// Single attachment preview that resolves a signed URL
const AttachmentPreview: React.FC<{ attachment: NonNullable<Message['attachments']>[number]; isImage?: boolean }>
  = ({ attachment, isImage }) => {
  const [url, setUrl] = useState<string | null>(attachment.signed_url ?? null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const signed = await ChatService.getSignedUrlForPath(attachment.storage_path);
        if (mounted) setUrl(signed);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load file');
      }
    })();
    return () => { mounted = false; };
  }, [attachment.storage_path]);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      let signed = url;
      if (!signed) {
        signed = await ChatService.getSignedUrlForPath(attachment.storage_path);
        setUrl(signed);
      }
      if (!signed) return;
      // Force download regardless of server Content-Disposition by downloading as Blob
      const response = await fetch(signed);
      if (!response.ok) throw new Error(`Download failed (${response.status})`);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = attachment.file_name || 'download';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err: any) {
      setError(err?.message || 'Failed to download');
    }
  };

  if (isImage) {
    return (
      <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white">
        {url ? (
          <>
            <img src={url} alt={attachment.file_name} className="w-full h-40 object-cover" />
            <button
              onClick={handleDownload}
              className="absolute top-2 right-2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow border border-gray-200"
              title={`Download ${attachment.file_name}`}
              aria-label={`Download ${attachment.file_name}`}
            >
              <Download className="w-4 h-4 text-gray-700" />
            </button>
          </>
        ) : (
          <div className="w-full h-40 flex items-center justify-center text-xs text-gray-500">
            {error ? 'Preview unavailable' : 'Loading image...'}
          </div>
        )}
      </div>
    );
  }

  return (
    <a
      href={url ?? undefined}
      onClick={handleDownload}
      // Intentionally omit target to prefer download behavior
      download={attachment.file_name}
      rel="noopener noreferrer"
      className="flex items-center justify-between gap-3 px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-900 text-xs hover:bg-gray-50"
      title={attachment.file_name}
      aria-label={`Download ${attachment.file_name}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="inline-block w-2 h-2 rounded-full bg-gray-400" aria-hidden></span>
        <span className="truncate max-w-[200px]">{attachment.file_name}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-500 whitespace-nowrap">
        <span>{(attachment.file_size/1024/1024).toFixed(1)}MB</span>
        <Download className="w-3.5 h-3.5" />
      </div>
    </a>
  );
};

export default MessageList;
