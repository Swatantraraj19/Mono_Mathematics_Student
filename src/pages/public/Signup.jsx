import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import logo from '../../assets/logo.png';

export const Signup = () => {
  const navigate = useNavigate();
  const { signup, authStatus, isAuthenticated } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated && authStatus === 'active') {
      navigate('/dashboard', { replace: true });
    } else if (authStatus === 'pending') {
      navigate('/verification-pending', { replace: true });
    }
  }, [isAuthenticated, authStatus, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Full Name is required.';
    }

    if (!email.trim()) {
      newErrors.email = 'Email Address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const result = await signup({ name, email, password });
      
      if (result.profile?.status === 'pending') {
        toast.success('Registration submitted! Awaiting administrator approval.');
        navigate('/verification-pending', { replace: true });
      } else {
        toast.success('Account created successfully! Welcome to Mono Mathematics.');
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      let message = 'Failed to create account. Please try again.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists. Please sign in.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password is too weak. Please use at least 8 characters.';
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
      <div className="w-full max-w-[440px] my-auto space-y-5">
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
            Student Registration
          </div>
        </div>

        {/* SaaS Registration Card */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-card p-6 sm:p-8 space-y-5">
          <div className="text-left">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Create Your Account
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Join Mono Mathematics Classes and start your learning journey.
            </p>
          </div>

          <form className="space-y-3.5" onSubmit={handleSubmit} noValidate>
            <div>
              <Input
                label="Full Name"
                type="text"
                placeholder="e.g. Rahul Kumar"
                icon={User}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                }}
                error={errors.name}
                disabled={isSubmitting}
                autoComplete="name"
                required
              />
            </div>

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

            <div>
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
                helperText="Password must be at least 8 characters."
                error={errors.password}
                disabled={isSubmitting}
                autoComplete="new-password"
                required
              />
            </div>

            <div>
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                icon={Lock}
                trailingIcon={showConfirmPassword ? EyeOff : Eye}
                onTrailingIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                trailingAriaLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: null }));
                }}
                error={errors.confirmPassword}
                disabled={isSubmitting}
                autoComplete="new-password"
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
                Create Account
              </Button>
            </div>
          </form>

          {/* Login Link */}
          <div className="border-t border-slate-100 pt-4 text-center">
            <p className="text-xs text-slate-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-primary-600 hover:text-primary-800 hover:underline ml-0.5"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
