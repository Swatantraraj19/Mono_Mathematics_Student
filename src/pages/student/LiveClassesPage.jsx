import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Radio,
  ExternalLink,
  Clock,
  Calendar,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  Video,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { fetchStudentLiveClasses } from '../../services/liveClassService';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDateDisplay, formatTimeDisplay, computeLiveClassStatus } from '../../utils/dateUtils';

export const LiveClassesPage = () => {
  const { userProfile, isProfileComplete } = useAuth();
  const studentClassId = userProfile?.classId;
  const studentStreamId = userProfile?.streamId;

  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'completed' | 'all'
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadLiveClasses = async () => {
      if (!studentClassId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const list = await fetchStudentLiveClasses(studentClassId, studentStreamId);
        if (isMounted) {
          setLiveClasses(list);
        }
      } catch (err) {
        console.error('Error fetching live classes:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadLiveClasses();

    // Re-evaluate live statuses in-memory every 30 seconds (0 network calls, 0 Firestore reads)
    const interval = setInterval(() => {
      if (!isMounted) return;
      setLiveClasses((prevList) => {
        let hasChanges = false;
        const updated = prevList.map((c) => {
          const newStatus = computeLiveClassStatus(c);
          if (newStatus !== c.computedStatus) {
            hasChanges = true;
            return { ...c, computedStatus: newStatus };
          }
          return c;
        });

        if (!hasChanges) return prevList;

        return updated.sort((a, b) => {
          const statusWeight = { live: 1, upcoming: 2, completed: 3, cancelled: 4 };
          const weightA = statusWeight[a.computedStatus] || 5;
          const weightB = statusWeight[b.computedStatus] || 5;
          if (weightA !== weightB) return weightA - weightB;

          const timeA = new Date(`${a.date}T${a.startTime || '00:00'}`).getTime() || 0;
          const timeB = new Date(`${b.date}T${b.startTime || '00:00'}`).getTime() || 0;
          if (a.computedStatus === 'completed' || a.computedStatus === 'cancelled') {
            return timeB - timeA;
          }
          return timeA - timeB;
        });
      });
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [studentClassId, studentStreamId]);

  const handleCopyLink = (item) => {
    if (!item.zoomUrl) return;
    navigator.clipboard.writeText(item.zoomUrl);
    setCopiedId(item.id);
    toast.success('Meeting link copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter based on active tab: upcoming includes currently live sessions
  const filteredClasses = liveClasses.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') {
      return item.computedStatus === 'upcoming' || item.computedStatus === 'live';
    }
    if (activeTab === 'completed') {
      return item.computedStatus === 'completed' || item.computedStatus === 'cancelled';
    }
    return true;
  });

  const liveNowCount = liveClasses.filter((c) => c.computedStatus === 'live').length;
  const upcomingTabCount = liveClasses.filter((c) => c.computedStatus === 'upcoming' || c.computedStatus === 'live').length;
  const completedTabCount = liveClasses.filter((c) => c.computedStatus === 'completed' || c.computedStatus === 'cancelled').length;

  if (!isProfileComplete) {
    return (
      <div className="student-card p-8 text-center space-y-4 max-w-lg mx-auto my-8">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900">
            Please complete your profile first
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Select your academic class from your profile to view your scheduled live classes.
          </p>
        </div>
        <Link to="/profile">
          <Button variant="primary" size="sm" className="font-bold">
            Go to Profile
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Live Classes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Join scheduled interactive live sessions for{' '}
            <span className="font-bold text-slate-800">
              {userProfile.className} {userProfile.streamName ? `• ${userProfile.streamName}` : ''}
            </span>
          </p>
        </div>

        {liveNowCount > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-pulse">
            <Radio className="w-4 h-4" />
            <span>{liveNowCount} Class Live Right Now</span>
          </div>
        )}
      </div>

      {/* Filter Tabs (3 Tabs: Upcoming, Completed, All Sessions) */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { key: 'upcoming', label: 'Upcoming', count: upcomingTabCount, hasPulse: liveNowCount > 0 },
          { key: 'completed', label: 'Completed', count: completedTabCount },
          { key: 'all', label: 'All Sessions', count: liveClasses.length },
        ].map((tab) => {
          const isSelected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer min-h-[40px] flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {tab.hasPulse && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
              )}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Live Classes Grid */}
      {loading ? (
        <SkeletonLoader variant="grid" rows={2} />
      ) : filteredClasses.length === 0 ? (
        <EmptyState
          icon={Radio}
          title={
            activeTab === 'upcoming'
              ? 'No Upcoming Classes Scheduled'
              : activeTab === 'completed'
              ? 'No Past Completed Sessions'
              : 'No Live Classes Found'
          }
          description={
            activeTab === 'upcoming'
              ? 'You have no live classes scheduled at this moment. Check back later!'
              : activeTab === 'completed'
              ? 'You have not completed any live class sessions yet.'
              : 'There are no live classes scheduled for you right now.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredClasses.map((item) => {
            const isLive = item.computedStatus === 'live';
            const isUpcoming = item.computedStatus === 'upcoming';
            const isCompleted = item.computedStatus === 'completed';
            const isCancelled = item.computedStatus === 'cancelled';

            return (
              <div
                key={item.id}
                className={`student-card p-3.5 sm:p-4 space-y-3 flex flex-col justify-between transition-all ${
                  isLive
                    ? 'border-rose-300 bg-gradient-to-br from-rose-50/40 to-white ring-1 ring-rose-200 shadow-sm'
                    : 'bg-white'
                }`}
              >
                <div className="space-y-2.5">
                  {/* Top Status & Subject Info */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] font-bold text-primary-700 uppercase tracking-wider block truncate">
                        {item.subjectName || 'Mathematics'}
                      </span>
                      <h2 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1">
                        {item.title}
                      </h2>
                    </div>

                    <Badge variant={item.computedStatus} size="sm" dot>
                      {item.computedStatus === 'live'
                        ? 'Live Now'
                        : item.computedStatus === 'upcoming'
                        ? 'Upcoming'
                        : item.computedStatus === 'completed'
                        ? 'Completed'
                        : 'Cancelled'}
                    </Badge>
                  </div>

                  {/* Date & Time Slot Information (Sleek horizontal row) */}
                  <div className="py-2 px-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {formatDateDisplay(item.date)}
                        {item.endDate && item.endDate !== item.date ? ` – ${formatDateDisplay(item.endDate)}` : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono text-[11px]">
                        {formatTimeDisplay(item.startTime)}
                        {item.endTime ? ` – ${formatTimeDisplay(item.endTime)}` : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  {item.zoomUrl && (
                    <button
                      type="button"
                      onClick={() => handleCopyLink(item)}
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1.5"
                      title="Copy Meeting Link"
                      aria-label="Copy Meeting Link"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 text-[11px]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[11px] hidden sm:inline">Copy Link</span>
                        </>
                      )}
                    </button>
                  )}

                  <div className="ml-auto">
                    {isLive ? (
                      <a
                        href={item.zoomUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="destructive"
                          size="sm"
                          className="bg-rose-600 hover:bg-rose-700 font-bold shadow-md text-xs"
                          icon={ExternalLink}
                          iconPosition="right"
                        >
                          Join Class Now
                        </Button>
                      </a>
                    ) : isUpcoming ? (
                      <a
                        href={item.zoomUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="primary"
                          size="sm"
                          className="font-bold text-xs"
                          icon={ExternalLink}
                          iconPosition="right"
                        >
                          Join Class
                        </Button>
                      </a>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400 py-1.5 px-2">
                        {isCancelled ? 'Session Cancelled' : 'Session Ended'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
