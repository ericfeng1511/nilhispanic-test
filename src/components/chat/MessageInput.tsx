import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Smile, Paperclip, Mic } from 'lucide-react';

interface MessageInputProps {
  onSend: (content: string) => Promise<void> | void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSend, disabled }) => {
  const [value, setValue] = useState('');
  const [pending, setPending] = useState(false);

  const handleSend = async () => {
    const content = value.trim();
    if (!content || pending || disabled) return;
    try {
      setPending(true);
      await onSend(content);
      setValue('');
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

  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 rounded-full flex-shrink-0">
          <Paperclip className="w-5 h-5 text-gray-500" />
        </Button>
        <div className="flex-1 relative">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type a message..."
            disabled={disabled || pending}
            className="pr-20 py-3 rounded-full border-gray-300 focus:border-nil-orange focus:ring-nil-orange bg-gray-50 focus:bg-white transition-colors"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            <Button variant="ghost" size="sm" className="p-1.5 hover:bg-gray-100 rounded-full">
              <Smile className="w-4 h-4 text-gray-500" />
            </Button>
            {value.trim() ? (
              <Button 
                onClick={handleSend} 
                disabled={disabled || pending || !value.trim()}
                size="sm"
                className="p-1.5 bg-nil-orange hover:bg-nil-navy rounded-full text-white border-0 shadow-sm"
              >
                {pending ? (
                  <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            ) : (
              <Button variant="ghost" size="sm" className="p-1.5 hover:bg-gray-100 rounded-full">
                <Mic className="w-4 h-4 text-gray-500" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
