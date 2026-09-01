import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import logo from '../../assets/logo.png';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Email Address is required.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await authService.sendPasswordReset(email);
      setIsSent(true);
      toast.success('Password reset email sent.');
    } catch (err) {
      let message = 'Failed to send reset link. Please check the email address.';
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
    <div className="min-h-[100dvh] w-full bg-slate-50 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-[420px] my-auto space-y-5">
        {/* Centered Logo Header */}
        <div className="flex flex-col items-center text-center">
          <Link to="/" className="w-18 h-18 sm:w-20 sm:h-20 flex items-center justify-center transition-transform hover:scale-105">
            <img
              src={logo}
              alt="Mono Mathematics Classes"
              className="w-full h-full object-contain drop-shadow-xs"
            />
          </Link>
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-primary-700 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-primary-600" />
            Account Recovery
          </div>
        </div>

        {/* SaaS Password Reset Card */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-card p-6 sm:p-8 space-y-5">
          {isSent ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 mx-auto bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-slate-900">
                  Check Your Inbox
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Password reset email sent. Check your inbox to continue.
                </p>
              </div>
              <div className="pt-3">
                <Link to="/login">
                  <Button variant="primary" className="w-full text-xs font-bold py-2.5">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-left">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Reset Password
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your registered email address to receive a password reset link.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
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

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full text-sm font-bold py-3 shadow-md"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Send Reset Link
                  </Button>
                </div>
              </form>

              <div className="border-t border-slate-100 pt-4 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-800 hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
