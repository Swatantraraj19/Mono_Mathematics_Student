import React from 'react';
import { ShieldAlert, Phone, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';

export const AccountInactive = () => {
  const { logout, userProfile } = useAuth();

  return (
    <div className="min-h-[100dvh] w-full bg-slate-50 flex flex-col justify-center items-center px-4 py-8 antialiased">
      <div className="w-full max-w-[440px] my-auto space-y-5">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-card p-6 sm:p-8 text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-red-50 text-status-error border border-red-200 rounded-3xl flex items-center justify-center shadow-xs">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Account Deactivated
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
              Your student account has been marked as inactive by the administration.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left flex items-start gap-3">
            <div className="p-2 rounded-xl bg-slate-200 text-slate-700 shrink-0 mt-0.5">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Contact Institute</p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Helpline: <span className="font-mono font-bold text-slate-800">8969351159 • 9060584382</span>
              </p>
            </div>
          </div>

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
