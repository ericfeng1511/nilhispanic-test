import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ isOpen, onClose }) => {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await requestPasswordReset(email);
    if (error) {
      setError(error.message || 'Failed to send reset link');
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setError(null);
      setLoading(false);
      setSent(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full sm:max-w-[425px] max-h-[90vh] overflow-y-auto overscroll-contain px-4">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-nil-navy">Reset Password</DialogTitle>
          <DialogDescription>
            Enter your email to receive a password reset link.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md text-sm text-green-800">
              If an account exists for {email}, a reset link has been sent. Please check your inbox.
            </div>
            <Button onClick={onClose} className="w-full h-12 bg-nil-orange text-white hover:bg-nil-navy transition-colors font-medium">Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-base"
                placeholder="Enter your email"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">{error}</div>
            )}

            <Button type="submit" disabled={loading} className="w-full h-12 bg-nil-orange text-white hover:bg-nil-navy transition-colors font-medium">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordModal;
