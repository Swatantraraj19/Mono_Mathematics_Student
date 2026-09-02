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
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, authStatus, navigate]);

  return (
    <div className="min-h-[100dvh] w-full bg-slate-50 flex flex-col justify-center items-center px-4 py-6 sm:py-10 antialiased selection:bg-indigo-100 selection:text-primary-800">
      <div className="w-full max-w-[390px] sm:max-w-[400px] my-auto">
        {/* Verification Status Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-card p-6 sm:p-7 text-center space-y-4">
          {/* Animated Clock Icon */}
          <div className="w-12 h-12 mx-auto bg-amber-50 text-amber-600 border border-amber-200 rounded-2xl flex items-center justify-center shadow-2xs">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-[11px] font-bold">
              <Sparkles className="w-3 h-3" />
              Approval Required
            </div>

            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Verification Pending
            </h1>

            <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto font-normal">
              Your account is awaiting administrator approval. You will receive access once approved.
            </p>
          </div>

          {/* Student Details Summary */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-left space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 font-medium">Name:</span>
              <span className="font-bold text-slate-800">{userProfile?.name || 'Student'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 font-medium">Email:</span>
              <span className="font-semibold text-slate-700 truncate max-w-[180px]" title={userProfile?.email}>
                {userProfile?.email}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 font-medium">Status:</span>
              <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[10px]">
                Pending Approval
              </span>
            </div>
          </div>

          {/* Institute Contact Info */}
          <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-left flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-100 text-primary-700 shrink-0 mt-0.5">
              <Phone className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Need fast approval?</p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Contact: <span className="font-mono font-bold text-primary-700">8969351159 • 9060584382</span>
              </p>
            </div>
          </div>

          {/* Logout Action */}
          <div className="pt-1">
            <Button
              variant="secondary"
              className="w-full text-xs font-bold py-2.5 rounded-xl"
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
