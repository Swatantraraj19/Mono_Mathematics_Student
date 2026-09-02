import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Phone, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';

export const AccountInactive = () => {
  const navigate = useNavigate();
  const { logout, authStatus, isAuthenticated } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      navigate('/login', { replace: true });
    } else if (isAuthenticated && authStatus === 'active') {
      navigate('/dashboard', { replace: true });
    }
  }, [authStatus, isAuthenticated, navigate]);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-slate-50 flex flex-col justify-center items-center px-4 py-6 sm:py-10 antialiased selection:bg-indigo-100 selection:text-primary-800">
      <div className="w-full max-w-[390px] sm:max-w-[400px] my-auto">
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-card p-6 sm:p-7 text-center space-y-4">
          <div className="w-12 h-12 mx-auto bg-red-50 text-status-error border border-red-200 rounded-2xl flex items-center justify-center shadow-2xs">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Account Deactivated
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto font-normal">
              Your student account has been marked as inactive by the administration.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-slate-200 text-slate-700 shrink-0 mt-0.5">
              <Phone className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Contact Institute</p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Helpline: <span className="font-mono font-bold text-slate-800">8969351159 • 9060584382</span>
              </p>
            </div>
          </div>

          <div className="pt-1">
            <Button
              variant="secondary"
              className="w-full text-xs font-bold py-2.5 rounded-xl cursor-pointer"
              icon={LogOut}
              isLoading={isLoggingOut}
              disabled={isLoggingOut}
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
