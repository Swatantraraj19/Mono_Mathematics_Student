import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { StudentLayout } from './components/layout/StudentLayout';
import { AppToaster } from './components/common/AppToaster';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Loader2 } from 'lucide-react';

// Public Lazy Loaded Pages
const LandingPage = lazy(() => import('./pages/public/LandingPage').then(m => ({ default: m.LandingPage })));
const Login = lazy(() => import('./pages/public/Login').then(m => ({ default: m.Login })));
const Signup = lazy(() => import('./pages/public/Signup').then(m => ({ default: m.Signup })));
const ForgotPassword = lazy(() => import('./pages/public/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const VerificationPending = lazy(() => import('./pages/public/VerificationPending').then(m => ({ default: m.VerificationPending })));
const AccountInactive = lazy(() => import('./pages/public/AccountInactive').then(m => ({ default: m.AccountInactive })));

// Authenticated Student Lazy Loaded Pages
const Dashboard = lazy(() => import('./pages/student/Dashboard').then(m => ({ default: m.Dashboard })));
const ProfilePage = lazy(() => import('./pages/student/ProfilePage').then(m => ({ default: m.ProfilePage })));
const LecturesPage = lazy(() => import('./pages/student/LecturesPage').then(m => ({ default: m.LecturesPage })));
const LiveClassesPage = lazy(() => import('./pages/student/LiveClassesPage').then(m => ({ default: m.LiveClassesPage })));

const PageFallback = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AppToaster />
          <Suspense fallback={<PageFallback />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verification-pending" element={<VerificationPending />} />
              <Route path="/account-inactive" element={<AccountInactive />} />

              {/* Authenticated Student Portal Routes */}
              <Route element={<ProtectedRoute><StudentLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/lectures" element={<LecturesPage />} />
                <Route path="/live-classes" element={<LiveClassesPage />} />
              </Route>

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
