import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Radio,
  ArrowRight,
  Sparkles,
  AlertCircle,
  ExternalLink,
  Layers,
  Clock,
  Video,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { fetchStudentSubjects } from '../../services/lectureService';
import { fetchStudentLiveClasses } from '../../services/liveClassService';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { formatDateDisplay, formatTimeDisplay } from '../../utils/dateUtils';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { userProfile, isProfileComplete } = useAuth();

  const [subjects, setSubjects] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const studentClassId = userProfile?.classId;
  const studentStreamId = userProfile?.streamId;

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      if (!studentClassId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [subjectsData, liveData] = await Promise.all([
          fetchStudentSubjects(studentClassId, studentStreamId),
          fetchStudentLiveClasses(studentClassId, studentStreamId),
        ]);

        if (isMounted) {
          setSubjects(subjectsData);
          setLiveSessions(liveData);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [studentClassId, studentStreamId]);

  // Find nearest upcoming or currently live class
  const activeOrUpcomingSession = liveSessions.find(
    (s) => s.computedStatus === 'live' || s.computedStatus === 'upcoming'
  );

  return (
    <div className="space-y-6 animate-fadeIn select-none">
      {/* 1. Welcome & Greeting Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        {/* Subtle decorative background circles */}
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-20 -bottom-10 w-32 h-32 bg-primary-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-indigo-100 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome back, {userProfile?.name?.split(' ')[0] || 'Student'}! 👋</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              {userProfile?.name || 'Student'}
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed max-w-xl">
              Access your structured syllabus, recorded video lectures, and live interactive classes.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Incomplete Profile Alert (If student has not selected class) */}
      {!isProfileComplete && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-amber-900">
                Please complete your profile first
              </h2>
              <p className="text-xs text-amber-700 mt-0.5">
                Select your class (and stream for Class 11–12) from your profile to access learning content.
              </p>
            </div>
          </div>
          <Link to="/profile" className="shrink-0 w-full sm:w-auto">
            <Button variant="primary" size="sm" className="w-full sm:w-auto font-bold bg-amber-600 hover:bg-amber-700">
              Go to Profile
            </Button>
          </Link>
        </div>
      )}

      {/* 3. Class & Academic Overview Card */}
      {isProfileComplete && (
        <div className="student-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-indigo-50 text-primary-600 border border-indigo-100">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Enrolled Academic Class
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-base sm:text-lg font-bold text-slate-900">
                  {userProfile.className}
                </span>
                {userProfile.streamName && (
                  <Badge variant="primary" size="sm">
                    {userProfile.streamName} Stream
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Link to="/profile" className="shrink-0 text-xs font-bold text-primary-600 hover:text-primary-800 flex items-center gap-1 hover:underline">
            Change in Profile <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 4. Live Session Highlight (If Live or Upcoming session exists) */}
      {activeOrUpcomingSession && (
        <div className="student-card border-rose-200 bg-gradient-to-br from-rose-50/50 via-white to-orange-50/30 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={activeOrUpcomingSession.computedStatus} dot>
                {activeOrUpcomingSession.computedStatus === 'live' ? 'Live Now' : 'Upcoming Session'}
              </Badge>
              <span className="text-xs font-semibold text-slate-600">
                {activeOrUpcomingSession.subjectName}
              </span>
            </div>
            <span className="text-xs font-mono font-medium text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDateDisplay(activeOrUpcomingSession.date)} • {formatTimeDisplay(activeOrUpcomingSession.startTime)}
            </span>
          </div>

          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              {activeOrUpcomingSession.title}
            </h2>
          </div>

          <div className="flex justify-end pt-1">
            {activeOrUpcomingSession.computedStatus === 'live' && activeOrUpcomingSession.zoomUrl ? (
              <a
                href={activeOrUpcomingSession.zoomUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="destructive"
                  size="sm"
                  className="bg-rose-600 hover:bg-rose-700 shadow-md font-bold text-xs"
                  icon={ExternalLink}
                  iconPosition="right"
                >
                  Join Class Now
                </Button>
              </a>
            ) : (
              <Link to="/live-classes">
                <Button variant="secondary" size="sm" className="text-xs font-semibold">
                  View Live Schedule
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* 5. Enrolled Subjects Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary-600" />
            Your Subjects
          </h2>
          {isProfileComplete && (
            <Link
              to="/lectures"
              className="text-xs font-bold text-primary-600 hover:text-primary-800 flex items-center gap-1 hover:underline"
            >
              All Lectures <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {loading ? (
          <SkeletonLoader variant="grid" rows={1} />
        ) : !isProfileComplete ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 space-y-2">
            <Layers className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">
              Select your class in Profile to see your enrolled subjects.
            </p>
          </div>
        ) : subjects.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 space-y-2">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">
              No subjects have been assigned to your class yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {subjects.map((sub) => (
              <div
                key={sub.id}
                onClick={() => navigate(`/lectures?subjectId=${sub.id}`)}
                className="student-card student-card-hover cursor-pointer p-4 flex flex-col justify-between space-y-4 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors truncate">
                      {sub.subjectName}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {userProfile.className} {sub.streamName ? `• ${sub.streamName}` : ''}
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-primary-600 flex items-center justify-center shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                    <Video className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-primary-600 pt-2 border-t border-slate-100">
                  <span>Browse Chapters</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
