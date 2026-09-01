import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Phone, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';

export const VerificationPending = () => {
  const navigate = useNavigate();
  const { authStatus, isAuthenticated, logout, userProfile } = useAuth();

  // Instant automatic promotion to Dashboard when Admin approves the student
  useEffect(() => {
    if (isAuthenticated && authStatus === 'active') {
      navigate('/dashboard', { replace: true });
    } else if (authStatus === 'unauthenticated') {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, authStatus, navigate]);

  return (
    <div className="min-h-[100dvh] w-full bg-slate-50 flex flex-col justify-center items-center px-4 py-8 antialiased">
      <div className="w-full max-w-[460px] my-auto space-y-5">
        {/* Verification Status Card */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-card p-6 sm:p-8 text-center space-y-6">
          {/* Animated Clock Icon */}
          <div className="w-16 h-16 mx-auto bg-amber-50 text-amber-600 border border-amber-200 rounded-3xl flex items-center justify-center shadow-xs">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              Approval Required
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Verification Pending
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
              Your account is awaiting administrator approval. You will receive access once your registration has been approved by Mono Mathematics Classes.
            </p>
          </div>

          {/* Student Details Summary */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 font-medium">Registered Name:</span>
              <span className="font-bold text-slate-800">{userProfile?.name || 'Student'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 font-medium">Account Email:</span>
              <span className="font-semibold text-slate-700 truncate max-w-[200px]" title={userProfile?.email}>
                {userProfile?.email}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 font-medium">Status:</span>
              <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Pending Approval
              </span>
            </div>
          </div>

          {/* Institute Contact Info */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-left flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-100/70 text-primary-700 shrink-0 mt-0.5">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Need fast approval?</p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Contact institute administration: <br />
                <span className="font-mono font-bold text-primary-700">8969351159 • 9060584382</span>
              </p>
            </div>
          </div>

          {/* Logout Action */}
          <div className="pt-2">
            <Button
              variant="secondary"
              className="w-full text-xs font-bold py-2.5"
              icon={LogOut}
              onClick={logout}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
