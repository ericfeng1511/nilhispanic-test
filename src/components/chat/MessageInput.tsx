import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
    <div className="border-t border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900 flex gap-2 items-center">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Type a message..."
        disabled={disabled || pending}
        className="flex-1"
      />
      <Button onClick={handleSend} disabled={disabled || pending || !value.trim()}>
        {pending ? 'Sending...' : 'Send'}
      </Button>
    </div>
  );
};

export default MessageInput;
