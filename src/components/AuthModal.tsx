import React, { useState, lazy, Suspense } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
    role: 'athlete' as 'athlete' | 'brand'
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const { signIn, signUp, resendVerification, requestPasswordReset } = useAuth();

  // Lazy-load the HTML-first viewer (falls back to PDF) to keep main bundle light
  const TermsContentViewer = lazy(() => import('./TermsContentViewer'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Prevent account creation if passwords do not match
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    // Require Terms & Conditions acceptance
    if (!isLogin && !termsAccepted) {
      setError('You must accept the Terms and Conditions.');
      setLoading(false);
      return;
    }

    try {
      let result;
      
      console.log('Attempting', isLogin ? 'sign in' : 'sign up', 'with email:', formData.email);
      
      if (isLogin) {
        result = await signIn(formData.email, formData.password);
      } else {
        // Force all new signups to the 'athlete' role
        result = await signUp(formData.email, formData.password, formData.fullName, 'athlete');
      }

      console.log('Auth result:', result);

      if (result.error) {
        console.error('Auth error:', result.error);
        if (result.needsVerification) {
          setError('Please check your email and click the verification link before signing in.');
          setPendingEmail(formData.email);
        } else {
          setError(result.error.message || 'An error occurred');
        }
      } else if (result.needsVerification) {
        // Signup successful but needs verification
        console.log('Signup successful, verification needed');
        setVerificationSent(true);
        setPendingEmail(formData.email);
        setError(null);
      } else {
        // Success - close modal and hard refresh page
        console.log('Auth successful, refreshing page...');
        onClose();
        setFormData({ email: '', password: '', fullName: '', confirmPassword: '', role: 'athlete' });
        setTermsAccepted(false);
        setError(null);
        setVerificationSent(false);
        setPendingEmail(null);
        
        // Hard refresh to eliminate any state management issues
        window.location.reload();
      }
    } catch (err) {
      console.error('Unexpected auth error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({ email: '', password: '', fullName: '', confirmPassword: '', role: 'athlete' });
    setTermsAccepted(false);
    setError(null);
    setShowPassword(false);
    setVerificationSent(false);
    setPendingEmail(null);
    setForgotMode(false);
    setResetSent(false);
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  const handleResendVerification = async () => {
    if (!pendingEmail) return;
    
    setLoading(true);
    const result = await resendVerification(pendingEmail);
    
    if (result.error) {
      setError(result.error.message || 'Failed to resend verification email');
    } else {
      setError(null);
      alert('Verification email sent! Please check your inbox.');
    }
    
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email to reset your password.');
      return;
    }
    setLoading(true);
    setError(null);
    const result = await requestPasswordReset(formData.email);
    if (result.error) {
      setError(result.error.message || 'Failed to send password reset email');
    } else {
      setResetSent(true);
    }
    setLoading(false);
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-full sm:max-w-[425px] max-h-[90vh] overflow-y-auto overscroll-contain px-4"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Place tooltip to the left of the title to avoid overlapping the dialog close button */}
              <InfoTooltip variant="desktop" />
              <DialogTitle className="text-2xl font-bold text-nil-navy">
                {verificationSent ? 'Check Your Email' : (isLogin ? 'Welcome Back' : 'Create Account')}
              </DialogTitle>
            </div>
            {/* Right side intentionally left empty so the dialog's native close X remains accessible */}
            <div className="w-8" aria-hidden />
          </div>
          <DialogDescription>
            {verificationSent 
              ? 'We sent a verification link to your email. Please click the link to activate your account.' 
              : (isLogin 
                ? 'Sign in to access your dashboard and opportunities.' 
                : 'Join our community of Hispanic student-athletes.'
              )
            }
          </DialogDescription>
        </DialogHeader>

        {verificationSent ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                Account created successfully! Please check your email ({pendingEmail}) and click the verification link.
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">
                Didn't receive the email? Check your spam folder or:
              </p>
              <Button
                type="button"
                onClick={handleResendVerification}
                disabled={loading}
                className="bg-nil-orange text-white hover:bg-nil-navy transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Resend Verification Email'
                )}
              </Button>
            </div>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setVerificationSent(false);
                  setPendingEmail(null);
                  setIsLogin(true);
                  resetForm();
                }}
                className="text-nil-navy hover:text-nil-orange transition-colors font-medium"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="h-12 text-base"
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="h-12 text-base"
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                required
                className="h-12 text-base pr-12"
                placeholder="Enter your password"
                minLength={6}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="h-12 text-base pr-12"
                  placeholder="Re-enter your password"
                  minLength={6}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          )}

          {/* Role selection removed: all new accounts are Student-Athletes by default */}

          {!isLogin && (
            <div className="flex items-center space-x-3">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(v) => setTermsAccepted(Boolean(v))}
                className="h-4 w-4 shrink-0"
              />
              <div className="grid gap-1 leading-5">
                <div className="text-sm text-gray-700">
                  <label htmlFor="terms" className="cursor-pointer mr-1">I agree to the</label>
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="text-nil-navy hover:text-nil-orange underline underline-offset-2 font-medium"
                  >
                    Terms and Conditions
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center justify-between gap-3">
              <span className="text-sm text-red-600">{error}</span>
              {isLogin && pendingEmail && (
                <Button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={loading}
                  className="h-8 px-3 bg-nil-orange text-white hover:bg-nil-navy transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Resending...
                    </>
                  ) : (
                    'Resend Verification Email'
                  )}
                </Button>
              )}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-nil-orange text-white hover:bg-nil-navy transition-colors font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </Button>

          {isLogin && (
            <div className="text-center space-y-3">
              {!forgotMode ? (
                <button
                  type="button"
                  onClick={() => { setForgotMode(true); setError(null); }}
                  className="text-nil-navy hover:text-nil-orange transition-colors font-medium"
                >
                  Forgot password?
                </button>
              ) : (
                <div className="space-y-3">
                  {!resetSent ? (
                    <>
                      <p className="text-sm text-gray-600">Enter your email above and send a reset link.</p>
                      <Button
                        type="button"
                        onClick={handleForgotPassword}
                        disabled={loading}
                        className="h-10 bg-nil-orange text-white hover:bg-nil-navy transition-colors"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          'Send Reset Link'
                        )}
                      </Button>
                    </>
                  ) : (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-800">
                      Password reset email sent to {formData.email}. Check your inbox.
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => { setForgotMode(false); setResetSent(false); setError(null); }}
                    className="block w-full text-nil-navy hover:text-nil-orange transition-colors font-medium"
                  >
                    Back to Sign In
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="text-center">
            <button
              type="button"
              onClick={switchMode}
              className="text-nil-navy hover:text-nil-orange transition-colors font-medium"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>

    {/* Terms and Conditions Modal
        To use: place your PDF at public/terms/terms.pdf
      */}
    <Dialog open={showTerms} onOpenChange={setShowTerms}>
      <DialogContent className="sm:max-w-[560px] mx-4">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-nil-navy">Terms and Conditions</DialogTitle>
          <DialogDescription>
            View the full Terms and Conditions below.
          </DialogDescription>
        </DialogHeader>
        <div className="w-full h-[70vh] max-h-[70vh]">
          <Suspense fallback={<div className="p-4 text-sm text-gray-600">Loading terms...</div>}>
            <TermsContentViewer htmlUrl="/terms/terms.html" pdfUrl="/terms/terms.pdf" />
          </Suspense>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};
