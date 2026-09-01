import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  Building2,
  Phone,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  UserCheck,
  Trophy,
  Rocket,
  Star,
  MessageCircle,
  LogIn,
  Download,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import logo from '../../assets/logo.png';
import heroImg from '../../assets/hero-illustration.jpg';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { authStatus, isAuthenticated } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // If already authenticated and active, route directly to Dashboard
  useEffect(() => {
    if (isAuthenticated && authStatus === 'active') {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, authStatus, navigate]);

  // PWA Install Prompt Listener (Same robust pattern as Food Junction)
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleCall = (phoneNumber) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/918969351159?text=Hello%20Mono%20Mathematics%20Classes,%20I%20want%20information%20about%20admissions.', '_blank');
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-slate-900 font-sans flex flex-col antialiased selection:bg-indigo-100 selection:text-primary-800">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER (Logo + PWA Install App Button + Login / Register)
      ─────────────────────────────────────────────────────────────── */}
      <header className="w-full bg-white border-b border-slate-200/80 sticky top-0 z-40 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
          
          {/* Left: Logo & PWA Install App Button */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center group shrink-0">
              <img
                src={logo}
                alt="Mono Mathematics"
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-xs group-hover:scale-105 transition-transform"
              />
            </Link>

            {/* PWA Install Button (Right of Logo, Auto-Hides when installed) */}
            {deferredPrompt && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white transition-all text-[10px] font-bold tracking-wider whitespace-nowrap shadow-2xs cursor-pointer"
              >
                <Download size={11} className="shrink-0" />
                <span>INSTALL APP</span>
              </button>
            )}
          </div>

          {/* Right Header Navigation Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Desktop Contact Us CTA */}
            <button
              type="button"
              onClick={() => handleCall('8969351159')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
            >
              <Phone className="w-3.5 h-3.5 text-primary-600" />
              <span>Contact Us</span>
            </button>

            {/* Login / Register Button (Matching Admin Button Scale) */}
            <Link to="/login">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 active:bg-primary-800 transition-all cursor-pointer shadow-xs whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" />
                <span>Login / Register</span>
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. HERO SECTION (Refined Admin-Grade Typography & Proportions)
      ─────────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-4 sm:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-6 space-y-3 sm:space-y-3.5 text-left">
            
            {/* Welcome Pill Badge */}
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-primary-700 text-[11px] font-semibold">
                <span>Welcome to Mono Mathematics Classes</span>
              </div>
            </div>

            {/* Main Headline (Scaled to Clean SaaS Proportions) */}
            <h1 className="text-2xl sm:text-3xl lg:text-[38px] font-extrabold text-slate-900 tracking-tight leading-tight">
              Learn Better. <br />
              <span className="text-primary-600">
                Grow Smarter.
              </span>
            </h1>

            {/* Subtitle Description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg font-normal">
              A dedicated learning platform for students from Class 6 to 12. Quality content, structured courses and concept clarity to help you achieve excellence.
            </p>

            {/* Feature Checkpoints (Clean 2-Col Grid) */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-0.5 max-w-md">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-primary-600 fill-indigo-50 shrink-0" />
                <span>Concept Clarity</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-primary-600 fill-indigo-50 shrink-0" />
                <span>Expert Guidance</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-primary-600 fill-indigo-50 shrink-0" />
                <span>Structured Learning</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-primary-600 fill-indigo-50 shrink-0" />
                <span>Better Results</span>
              </div>
            </div>

            {/* CTA Buttons (Admin-Style Sleek Buttons) */}
            <div className="flex items-center gap-2.5 pt-1">
              <Link to="/signup" className="flex-1 sm:flex-none">
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 active:bg-primary-800 shadow-xs transition-all cursor-pointer whitespace-nowrap"
                >
                  <Rocket className="w-3.5 h-3.5 shrink-0" />
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              </Link>

              <button
                type="button"
                onClick={() => handleCall('8969351159')}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 shadow-2xs transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                <Phone className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                <span>Call Us</span>
              </button>
            </div>
          </div>

          {/* Right Hero Card Graphic */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-[440px] rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 bg-white p-1">
              <img
                src={heroImg}
                alt="Mono Mathematics Learning Experience"
                className="w-full h-auto max-h-[190px] sm:max-h-[235px] object-cover rounded-xl"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. ABOUT & ACADEMIC INFORMATION SECTION (Admin-Matching Cards)
      ─────────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-1 pb-4 sm:pb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-3.5">
          
          {/* Card 1: About Mono Mathematics Classes */}
          <div className="md:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-2">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-50 text-primary-600 border border-indigo-100 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">
                  About Mono Mathematics Classes
                </h2>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                We are committed to building strong mathematical foundations for school students with a focus on understanding, practice and performance.
              </p>
            </div>
          </div>

          {/* Right 3 Stat Cards */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-3.5">
            
            {/* Card 2: Classes */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 shadow-2xs flex sm:flex-col items-center sm:items-start justify-between sm:justify-between gap-3 sm:gap-0 sm:space-y-1.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-50 text-primary-600 border border-indigo-100 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 flex-1 sm:flex-none">
                <span className="text-[10px] font-bold text-primary-700 uppercase tracking-wider block">
                  Classes
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  6th to 12th
                </h3>
                <p className="text-[10px] text-slate-400">
                  Comprehensive courses
                </p>
              </div>
            </div>

            {/* Card 3: Streams */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 shadow-2xs flex sm:flex-col items-center sm:items-start justify-between sm:justify-between gap-3 sm:gap-0 sm:space-y-1.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 flex-1 sm:flex-none">
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                  Streams
                </span>
                <h3 className="text-xs sm:text-[14px] font-extrabold text-slate-900 leading-tight">
                  Science, Arts & Commerce
                </h3>
                <p className="text-[10px] text-slate-400">
                  All major streams
                </p>
              </div>
            </div>

            {/* Card 4: Branches */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 shadow-2xs flex sm:flex-col items-center sm:items-start justify-between sm:justify-between gap-3 sm:gap-0 sm:space-y-1.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 flex-1 sm:flex-none">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                  Branches
                </span>
                <h3 className="text-xs sm:text-[13px] font-extrabold text-slate-900 leading-snug">
                  Dhanuki, Madhopur, Ganjpar
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  3 Branches
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. PURPLE JOURNEY CALLOUT BANNER
      ─────────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5">
        <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#2F1FAD] via-[#3C2BD8] to-[#4F46E5] p-4 sm:p-6 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-5 relative overflow-hidden">
          
          {/* Subtle background circles */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          {/* Left: Star Icon + Headline + Subtext */}
          <div className="flex items-start sm:items-center gap-3 relative z-10">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 fill-amber-300" />
            </div>

            <div className="space-y-0.5">
              <h2 className="text-sm sm:text-base lg:text-lg font-extrabold tracking-tight text-white">
                Your learning journey starts here.
              </h2>
              <p className="text-xs text-indigo-100/90 max-w-xl font-normal leading-relaxed">
                Login or register now to access your classes, subjects, chapters, live classes and recorded lectures.
              </p>
            </div>
          </div>

          {/* Right: Login / Register Button */}
          <div className="relative z-10 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
            <Link to="/login" className="w-full sm:w-auto block">
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-primary-700 bg-white hover:bg-slate-50 active:bg-slate-100 shadow-xs transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Login / Register</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. CONTACT & NEED HELP BAR
      ─────────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:p-5 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Left: Need help? */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-primary-600 flex items-center justify-center shrink-0 border border-indigo-100/70">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                Need help?
              </span>
              <span className="text-[11px] sm:text-xs text-slate-500">
                We are just a call away.
              </span>
            </div>
          </div>

          {/* Middle: Phone numbers */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6">
            <button
              type="button"
              onClick={() => handleCall('8969351159')}
              className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold text-slate-800 hover:text-primary-600 transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-primary-600 flex items-center justify-center">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <span>8969351159</span>
            </button>

            <button
              type="button"
              onClick={() => handleCall('9060584382')}
              className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold text-slate-800 hover:text-primary-600 transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-primary-600 flex items-center justify-center">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <span>9060584382</span>
            </button>
          </div>

          {/* Right: WhatsApp / Call Now Action */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleWhatsApp}
              className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-emerald-700 bg-white hover:bg-emerald-50 border border-emerald-300 shadow-2xs transition-all cursor-pointer whitespace-nowrap"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
              <span>Call Now</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. FOOTER
      ─────────────────────────────────────────────────────────────── */}
      <footer className="w-full bg-[#0F172A] text-slate-400 py-4 text-center text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} Mono Mathematics Classes. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
