import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import logo from '../../assets/logo.png';

export const Login = () => {
  const navigate = useNavigate();
  const { login, authStatus, isAuthenticated } = useAuth();

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

  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email Address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success('Signed in successfully!');
    } catch (err) {
      let message = 'Failed to sign in. Please check your credentials.';
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password'
      ) {
        message = 'Invalid email or password.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Please try again later.';
      } else if (err.message) {
        message = err.message;
      }
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
            Student Login
          </div>
        </div>

        {/* SaaS Login Card */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-card p-6 sm:p-8 space-y-5">
          <div className="text-left">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Sign in to continue your learning journey.
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
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-primary-600 hover:text-primary-800 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full text-sm font-bold py-3 shadow-md"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Sign In
              </Button>
            </div>
          </form>

          {/* Register Link */}
          <div className="border-t border-slate-100 pt-4 text-center">
            <p className="text-xs text-slate-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-bold text-primary-600 hover:text-primary-800 hover:underline ml-0.5"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
