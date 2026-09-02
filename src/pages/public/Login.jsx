import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, authStatus, isAuthenticated } = useAuth();
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [isResetSending, setIsResetSending] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated && authStatus === 'active') {
      navigate('/dashboard', { replace: true });
    } else if (authStatus === 'pending') {
      navigate('/verification-pending', { replace: true });
    } else if (authStatus === 'inactive') {
      navigate('/account-inactive', { replace: true });
    }
  }, [isAuthenticated, authStatus, navigate]);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrors((prev) => ({ ...prev, email: 'Enter your email address to reset password' }));
      toast.error('Please enter your email address to receive reset link.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrors((prev) => ({ ...prev, email: 'Enter a valid email address' }));
      toast.error('Please enter a valid email address.');
      return;
    }

    setIsResetSending(true);
    try {
      await authService.sendPasswordReset(email.trim());
      toast.success(`Reset link sent to ${email.trim()}! Check your inbox.`);
    } catch (err) {
      let message = 'Failed to send reset link.';
      if (err.code === 'auth/user-not-found') {
        message = 'No account registered with this email address.';
      } else if (err.message) {
        message = err.message;
      }
      toast.error(message);
    } finally {
      setIsResetSending(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleSubmitting(true);
    try {
      await loginWithGoogle();
      toast.success('Welcome back! Signed in with Google.');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error(err.message || 'Failed to sign in with Google.');
      }
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      newErrors.email = 'Email address is required';
    } else if (cleanEmail.length > 254) {
      newErrors.email = 'Email address is too long';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (password.length > 128) {
      newErrors.password = 'Password cannot exceed 128 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!navigator.onLine) {
      toast.error('No internet connection. Please check your network.');
      return;
    }

    if (!validateForm()) return;

    try {
      const result = await login(email.trim().toLowerCase(), password);
      if (result.profile?.status === 'inactive') {
        navigate('/account-inactive', { replace: true });
        return;
      }
      if (result.profile?.status === 'pending') {
        navigate('/verification-pending', { replace: true });
        return;
      }
      toast.success('Welcome back! Signed in successfully.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      let message = 'Failed to sign in. Please check your credentials.';
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password'
      ) {
        message = 'Invalid email or password.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Too many attempts. Please try again later.';
      } else if (err.code === 'auth/network-request-failed') {
        message = 'Network error. Please check your connection.';
      } else if (err.code === 'auth/user-disabled') {
        message = 'This account has been deactivated.';
      } else if (err.message) {
        message = err.message;
      }
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
          
          {/* Card Header */}
          <div className="text-left space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Sign in to your account
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-500 font-normal">
              Enter your credentials to access your student portal
            </p>
          </div>

          {/* Continue with Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleSubmitting || isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-60 min-h-[44px]"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isGoogleSubmitting ? 'Signing in...' : 'Continue with Google'}</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-100 w-full" />
            <span className="bg-white px-2.5 text-[10px] uppercase font-bold tracking-wider text-slate-400 shrink-0">
              or continue with email
            </span>
            <div className="border-t border-slate-100 w-full" />
          </div>

          {/* Form */}
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
                  if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                }}
                error={errors.email}
                disabled={isSubmitting}
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-1">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                icon={Lock}
                trailingIcon={showPassword ? EyeOff : Eye}
                onTrailingIconClick={() => setShowPassword(!showPassword)}
                trailingAriaLabel={showPassword ? 'Hide password' : 'Show password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                }}
                error={errors.password}
                disabled={isSubmitting}
                autoComplete="current-password"
                required
              />

              <div className="flex justify-end pt-0.5">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isResetSending || isSubmitting}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-800 hover:underline cursor-pointer disabled:opacity-50"
                >
                  {isResetSending ? 'Sending reset link...' : 'Forgot Password?'}
                </button>
              </div>
            </div>

            <div className="pt-1">
              <Button
                type="submit"
                variant="primary"
                className="w-full text-xs sm:text-sm font-bold py-2.5 rounded-xl shadow-xs"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Sign In
              </Button>
            </div>
          </form>

          {/* Bottom Actions: Register & Back to Home */}
          <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
            <p className="text-slate-600">
              New student?{' '}
              <Link
                to="/signup"
                className="font-bold text-primary-600 hover:text-primary-800 hover:underline ml-0.5"
              >
                Register
              </Link>
            </p>

            <Link
              to="/"
              className="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-slate-900 transition-colors py-1 px-2 rounded-lg hover:bg-slate-50"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
