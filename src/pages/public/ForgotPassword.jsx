import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Email address is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await authService.sendPasswordReset(email.trim());
      setIsSent(true);
      toast.success('Password reset email sent.');
    } catch (err) {
      let message = 'Failed to send reset link.';
      if (err.code === 'auth/user-not-found') {
        message = 'No account found with this email address.';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-slate-50 flex flex-col justify-center items-center px-4 py-6 sm:py-10 antialiased selection:bg-indigo-100 selection:text-primary-800">
      <div className="w-full max-w-[390px] sm:max-w-[400px] my-auto">
        
        {/* SaaS Card with Crisp Border & Shadow */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-card p-5 sm:p-7 space-y-4 sm:space-y-5">
          {isSent ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 mx-auto bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-900">
                  Check Your Inbox
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Password reset link has been sent to your email. Check your inbox to continue.
                </p>
              </div>
              <div className="pt-1">
                <Link to="/login">
                  <Button variant="primary" className="w-full text-xs sm:text-sm font-bold py-2.5 rounded-xl">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-left space-y-1">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Reset your password
                </h1>
                <p className="text-xs sm:text-[13px] text-slate-500 font-normal">
                  Enter your registered email to receive a secure password reset link
                </p>
              </div>

              <form className="space-y-3.5" onSubmit={handleSubmit} noValidate>
                <div>
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="student@example.com"
                    icon={Mail}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    error={error}
                    disabled={isSubmitting}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="pt-1">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full text-xs sm:text-sm font-bold py-2.5 rounded-xl shadow-xs"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Send Reset Link
                  </Button>
                </div>
              </form>

              <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 font-semibold text-primary-600 hover:text-primary-800 hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Login</span>
                </Link>

                <Link
                  to="/"
                  className="font-semibold text-slate-500 hover:text-slate-900 transition-colors py-1 px-2 rounded-lg hover:bg-slate-50"
                >
                  Home
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
