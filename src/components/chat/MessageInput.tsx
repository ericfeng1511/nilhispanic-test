import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip } from 'lucide-react';

interface MessageInputProps {
  onSend: (content: string) => Promise<void> | void;
  onSendWithAttachments?: (content: string, files: File[]) => Promise<void> | void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSend, onSendWithAttachments, disabled }) => {
  const [value, setValue] = useState('');
  const [pending, setPending] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleSend = async () => {
    const content = value.trim();
    const hasFiles = files.length > 0;
    if ((!
      content && !hasFiles
    ) || pending || disabled) return;
    try {
      setPending(true);
      if (hasFiles && onSendWithAttachments) {
        await onSendWithAttachments(content, files);
        setFiles([]);
        setValue('');
      } else {
        await onSend(content);
        setValue('');
      }
    } finally {
      setPending(false);
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onPickFiles: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = Array.from(e.target.files || []);
    if (!f.length) return;
    // Basic validation: limit count and size (~10MB each)
    const MAX_FILES = 5;
    const MAX_SIZE = 10 * 1024 * 1024;
    const filtered = f.filter((file) => file.size <= MAX_SIZE);
    const next = [...files, ...filtered].slice(0, MAX_FILES);
    setFiles(next);
    // Reset input value to allow re-adding the same file later
    e.currentTarget.value = '';
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      <div className="flex items-center gap-3">
        <input
          id="chat-file-input"
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xlsx"
          className="hidden"
          onChange={onPickFiles}
          aria-hidden
        />
        <Button
          variant="ghost"
          size="sm"
          className="p-2 hover:bg-gray-100 rounded-full flex-shrink-0"
          onClick={() => document.getElementById('chat-file-input')?.click()}
          disabled={disabled || pending}
          aria-label="Attach files"
        >
          <Paperclip className="w-5 h-5 text-gray-500" />
        </Button>
        <div className="flex-1 relative">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type a message..."
            disabled={disabled || pending}
            className="pr-12 py-3 rounded-full border-gray-300 focus:border-nil-orange focus:ring-nil-orange bg-gray-50 focus:bg-white transition-colors"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {value.trim() || files.length > 0 ? (
              <Button 
                onClick={handleSend} 
                disabled={disabled || pending || (!value.trim() && files.length === 0)}
                size="sm"
                className="p-1.5 bg-nil-orange hover:bg-nil-navy rounded-full text-white border-0 shadow-sm"
              >
                {pending ? (
                  <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
      {files.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {files.map((f, idx) => (
            <div key={idx} className="px-2 py-1.5 text-xs border border-gray-200 bg-gray-50 rounded-full flex items-center gap-2">
              <span className="max-w-[220px] truncate" title={`${f.name} • ${(f.size/1024/1024).toFixed(1)}MB`}>{f.name}</span>
              <span className="text-gray-500">{(f.size/1024/1024).toFixed(1)}MB</span>
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="text-gray-400 hover:text-red-500"
                aria-label={`Remove ${f.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageInput;
