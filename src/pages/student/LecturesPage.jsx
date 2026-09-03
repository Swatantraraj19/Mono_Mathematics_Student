import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Video,
  Play,
  BookOpen,
  Search,
  Clock,
  Sparkles,
  AlertCircle,
  ExternalLink,
  Layers,
  GraduationCap,
  Bookmark,
  X,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import {
  fetchStudentSubjects,
  fetchStudentChapters,
  fetchStudentVideos,
  searchStudentLectures,
  extractYouTubeVideoId,
} from '../../services/lectureService';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';

export const LecturesPage = () => {
  const [searchParams] = useSearchParams();
  const initialSubjectId = searchParams.get('subjectId');

  const { userProfile, isProfileComplete } = useAuth();
  const studentClassId = userProfile?.classId;
  const studentStreamId = userProfile?.streamId;

  // Master State
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(initialSubjectId || '');
  const [chapters, setChapters] = useState([]);
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [chapterVideos, setChapterVideos] = useState({}); // Cache: { [chapterId]: Video[] }

  // Loading States
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(false);

  // Global Search State within Student's Syllabus
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Active Video Player Modal
  const [playingVideo, setPlayingVideo] = useState(null);

  // 1. Load subjects mapped to student's class and stream
  useEffect(() => {
    let isMounted = true;
    const loadSubjects = async () => {
      if (!studentClassId) {
        setLoadingSubjects(false);
        return;
      }

      setLoadingSubjects(true);
      try {
        const subs = await fetchStudentSubjects(studentClassId, studentStreamId);
        if (isMounted) {
          setSubjects(subs);
          if (subs.length > 0) {
            const matched = subs.find((s) => s.id === initialSubjectId);
            setSelectedSubjectId(matched ? matched.id : subs[0].id);
          } else {
            setSelectedSubjectId('');
          }
        }
      } catch (err) {
        console.error('Error fetching student subjects:', err);
      } finally {
        if (isMounted) setLoadingSubjects(false);
      }
    };

    loadSubjects();
    return () => {
      isMounted = false;
    };
  }, [studentClassId, studentStreamId, initialSubjectId]);

  // 2. Load chapters whenever selected subject changes
  useEffect(() => {
    let isMounted = true;
    const loadChapters = async () => {
      if (!selectedSubjectId) {
        setChapters([]);
        setSelectedChapterId('');
        return;
      }

      setLoadingChapters(true);
      try {
        const chaps = await fetchStudentChapters(selectedSubjectId);
        if (isMounted) {
          setChapters(chaps);
          if (chaps.length > 0) {
            setSelectedChapterId(chaps[0].id);
          } else {
            setSelectedChapterId('');
          }
        }
      } catch (err) {
        console.error('Error fetching student chapters:', err);
      } finally {
        if (isMounted) setLoadingChapters(false);
      }
    };

    loadChapters();
    return () => {
      isMounted = false;
    };
  }, [selectedSubjectId]);

  // 3. Load videos whenever selected chapter changes (uses in-memory cache)
  useEffect(() => {
    let isMounted = true;
    const loadVideos = async () => {
      if (!selectedChapterId) return;

      // If already cached in memory, no Firestore query needed!
      if (chapterVideos[selectedChapterId]) return;

      setLoadingVideos(true);
      try {
        const vids = await fetchStudentVideos(selectedChapterId);
        if (isMounted) {
          setChapterVideos((prev) => ({
            ...prev,
            [selectedChapterId]: vids,
          }));
        }
      } catch (err) {
        console.error('Error fetching chapter videos:', err);
      } finally {
        if (isMounted) setLoadingVideos(false);
      }
    };

    loadVideos();
    return () => {
      isMounted = false;
    };
  }, [selectedChapterId, chapterVideos]);

  // 4. Handle Search Input with debounce
  useEffect(() => {
    let isMounted = true;
    const trimmed = searchQuery.trim();

    if (!trimmed) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const results = await searchStudentLectures(studentClassId, studentStreamId, trimmed);
        if (isMounted) {
          setSearchResults(results);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        if (isMounted) setIsSearching(false);
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [searchQuery, studentClassId, studentStreamId]);

  // Active Subject & Chapter helpers
  const activeSubjectObj = useMemo(() => {
    return subjects.find((s) => s.id === selectedSubjectId);
  }, [subjects, selectedSubjectId]);

  const activeChapterObj = useMemo(() => {
    return chapters.find((c) => c.id === selectedChapterId);
  }, [chapters, selectedChapterId]);

  // Currently displayed videos for chapter
  const currentChapterVideos = useMemo(() => {
    if (!selectedChapterId) return [];
    return chapterVideos[selectedChapterId] || [];
  }, [chapterVideos, selectedChapterId]);

  // YouTube Video ID for the modal player
  const activeYouTubeId = useMemo(() => {
    if (!playingVideo) return null;
    return playingVideo.youtubeVideoId || extractYouTubeVideoId(playingVideo.videoUrl);
  }, [playingVideo]);

  // Incomplete Profile Barrier
  if (!isProfileComplete) {
    return (
      <div className="space-y-6 animate-fadeIn select-none">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Recorded Lectures
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Access your chapter-wise syllabus and video lectures.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-amber-50 border border-amber-200 text-center space-y-3 max-w-lg mx-auto my-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-amber-900">
            Profile Completion Required
          </h2>
          <p className="text-xs text-amber-700 max-w-sm mx-auto leading-relaxed">
            Please complete your profile by selecting your academic class (and stream for 11–12) to unlock recorded lectures.
          </p>
          <Link to="/profile" className="inline-block pt-1">
            <Button variant="primary" size="sm" className="font-bold bg-amber-600 hover:bg-amber-700 shadow-xs">
              Go to Profile
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 animate-fadeIn select-none">
      {/* 1. Page Header (Preserved 100% as approved) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Recorded Lectures
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs sm:text-sm text-slate-500">Syllabus for</span>
            <Badge variant="primary" size="sm">
              {userProfile?.className || 'Class'}
              {userProfile?.streamName ? ` • ${userProfile.streamName}` : ''}
            </Badge>
          </div>
        </div>

        {/* Global Search Input with Instant Clear */}
        <div className="w-full sm:w-80 relative">
          <Input
            type="text"
            placeholder="Search topic or lecture..."
            icon={Search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs py-2 pr-8"
            aria-label="Search lectures"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-0 top-0 bottom-0 w-8 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Enterprise Academic Hierarchy Selectors Card (Admin Inspired) */}
      <div className="student-card p-3 sm:p-4 space-y-2.5 shadow-xs border border-slate-200/80">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Subject Dropdown */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Select Subject
            </label>
            <Select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              disabled={loadingSubjects || subjects.length === 0}
              placeholder={loadingSubjects ? 'Loading subjects...' : 'Select Subject'}
              options={subjects.map((s) => ({
                value: s.id,
                label: s.subjectName,
              }))}
              aria-label="Select Subject"
            />
          </div>

          {/* Chapter Dropdown */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Select Chapter
            </label>
            <Select
              value={selectedChapterId}
              onChange={(e) => setSelectedChapterId(e.target.value)}
              disabled={loadingChapters || chapters.length === 0}
              placeholder={
                loadingChapters
                  ? 'Loading chapters...'
                  : chapters.length === 0
                  ? 'No chapters in this subject'
                  : 'Select Chapter'
              }
              options={chapters.map((ch) => ({
                value: ch.id,
                label: `#${ch.chapterNumber} ${ch.name}`,
              }))}
              aria-label="Select Chapter"
            />
          </div>
        </div>

        {/* Dynamic Summary Strip / Search State */}
        {!loadingSubjects && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
            {searchQuery.trim() ? (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0"></span>
                <span>
                  Search results for "<strong>{searchQuery.trim()}</strong>":
                </span>
                <span className="font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md text-[11px]">
                  {searchResults.length} lecture{searchResults.length !== 1 ? 's' : ''} found
                </span>
              </div>
            ) : selectedChapterId && activeChapterObj ? (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="font-bold text-slate-800">
                  {currentChapterVideos.length} Lecture{currentChapterVideos.length !== 1 ? 's' : ''} in this chapter
                </span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="text-slate-500 hidden sm:inline font-medium text-[11px]">
                  Ch #{activeChapterObj.chapterNumber}: {activeChapterObj.name}
                </span>
              </div>
            ) : (
              <span className="text-slate-400 text-xs">
                Select a subject and chapter above to browse recorded lectures.
              </span>
            )}

            {searchQuery.trim() && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs font-semibold text-primary-600 hover:text-primary-800 hover:underline cursor-pointer"
              >
                Back to chapter view
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. Main Content: Video Lectures Grid (Admin Pattern) */}
      {loadingSubjects || loadingChapters ? (
        <SkeletonLoader variant="grid" rows={2} />
      ) : searchQuery.trim() ? (
        /* ======================== GLOBAL SEARCH VIEW ======================== */
        <div>
          {isSearching ? (
            <SkeletonLoader variant="grid" rows={2} />
          ) : searchResults.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No Matching Lectures Found"
              description={`No lectures found matching "${searchQuery}". Try searching for another topic or concept.`}
              actionLabel="Clear Search"
              onAction={() => setSearchQuery('')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {searchResults.map((v) => renderVideoCard(v, () => setPlayingVideo(v)))}
            </div>
          )}
        </div>
      ) : (
        /* ======================== CHAPTER-SCOPED VIEW ======================== */
        <div>
          {loadingVideos ? (
            <SkeletonLoader variant="grid" rows={2} />
          ) : !selectedChapterId ? (
            <EmptyState
              icon={Bookmark}
              title="No Chapter Selected"
              description="Please select an academic subject and chapter above to view recorded lectures."
            />
          ) : currentChapterVideos.length === 0 ? (
            <EmptyState
              icon={Video}
              title="No Lectures Added Yet"
              description={`No video lectures have been uploaded for "${activeChapterObj?.name || 'this chapter'}" yet.`}
            />
          ) : (
            <>
              {/* Desktop & Tablet: 3-Column SaaS Card Grid (>= 640px) */}
              <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentChapterVideos.map((v) => renderVideoCard(v, () => setPlayingVideo(v)))}
              </div>

              {/* Mobile: High-Density List (< 640px) */}
              <div className="grid grid-cols-1 gap-2.5 sm:hidden">
                {currentChapterVideos.map((v) => renderMobileVideoCard(v, () => setPlayingVideo(v)))}
              </div>
            </>
          )}
        </div>
      )}

      {/* 4. Theater Mode Video Player Modal */}
      {playingVideo && (
        <Modal
          isOpen={Boolean(playingVideo)}
          onClose={() => setPlayingVideo(null)}
          title={playingVideo.title}
          subtitle={`${playingVideo.subjectName || activeSubjectObj?.subjectName || 'Subject'} • ${playingVideo.chapterName || activeChapterObj?.name || 'Chapter'}`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-4">
            {/* 16:9 Responsive Embed */}
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg">
              {activeYouTubeId ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${activeYouTubeId}?autoplay=1&rel=0&modestbranding=1`}
                  title={playingVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-amber-500" />
                  <p className="text-xs sm:text-sm">Unable to load video stream for this lecture.</p>
                </div>
              )}
            </div>

            {/* Video Meta Info Footer */}
            <div className="flex items-center justify-between gap-2 text-xs text-slate-600 flex-wrap pt-1 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md">
                  Lecture #{playingVideo.orderIndex || 1}
                </span>
                {playingVideo.duration && playingVideo.duration !== 'N/A' && (
                  <span className="flex items-center gap-1 text-slate-500 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {playingVideo.duration}
                  </span>
                )}
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPlayingVideo(null)}
                className="text-xs font-semibold"
              >
                Close Player
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

/**
 * Desktop Video Card Component
 */
const renderVideoCard = (v, onPlay) => {
  const ytId = v.youtubeVideoId || extractYouTubeVideoId(v.videoUrl);
  const thumb = v.thumbnailUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null);

  return (
    <div
      key={v.id}
      className="student-card student-card-hover p-3.5 sm:p-4 flex flex-col justify-between space-y-3 group border border-slate-200/80 hover:border-primary-300 transition-all shadow-xs"
    >
      <div className="space-y-2.5">
        {/* 16:9 YouTube Thumbnail Container with Play Overlay */}
        <div
          onClick={onPlay}
          className="relative aspect-video w-full rounded-xl bg-slate-900 overflow-hidden shrink-0 group cursor-pointer shadow-xs border border-slate-200/60"
          title="Click to watch lecture"
        >
          {thumb ? (
            <img
              src={thumb}
              alt={v.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
              <Video className="w-8 h-8" />
            </div>
          )}

          <div className="absolute inset-0 bg-slate-900/30 group-hover:bg-slate-900/15 transition-colors flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-primary-600/90 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <Play className="w-4 h-4 fill-white ml-0.5" />
            </div>
          </div>

          {v.duration && v.duration !== 'N/A' && (
            <span className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-xs text-white text-[10px] font-mono px-1.5 py-0.5 rounded-md flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-300" />
              {v.duration}
            </span>
          )}
        </div>

        {/* Lecture Meta & Title */}
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 bg-indigo-50 text-primary-700 rounded-md">
              Lecture #{v.orderIndex || 1}
            </span>
            {v.chapterName && (
              <span className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">
                • {v.chapterName}
              </span>
            )}
          </div>
          <h3
            onClick={onPlay}
            className="text-sm font-bold text-slate-900 line-clamp-2 mt-1.5 group-hover:text-primary-600 transition-colors cursor-pointer leading-snug"
            title={v.title}
          >
            {v.title}
          </h3>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-400">Video Lecture</span>
        <Button
          variant="primary"
          size="sm"
          icon={Play}
          onClick={onPlay}
          className="text-xs font-bold shadow-xs py-1.5 px-3"
        >
          Watch Lecture
        </Button>
      </div>
    </div>
  );
};

/**
 * Mobile High-Density Video Card (< 640px)
 */
const renderMobileVideoCard = (v, onPlay) => {
  const ytId = v.youtubeVideoId || extractYouTubeVideoId(v.videoUrl);
  const thumb = v.thumbnailUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null);

  return (
    <div
      key={v.id}
      onClick={onPlay}
      className="student-card !p-2.5 flex items-center justify-between gap-3 hover:border-primary-200 transition-colors shadow-2xs cursor-pointer active:bg-slate-50"
    >
      {/* Left: 16:9 Thumbnail with Play Icon */}
      <div className="relative w-22 h-14 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-200 shadow-2xs">
        {thumb ? (
          <img
            src={thumb}
            alt={v.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
            <Video className="w-5 h-5" />
          </div>
        )}
        <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-white/90 text-primary-700 flex items-center justify-center shadow-xs">
            <Play className="w-3 h-3 fill-primary-700 ml-0.5" />
          </div>
        </div>
      </div>

      {/* Middle: Title & Meta */}
      <div className="min-w-0 flex-1">
        <h4 className="text-xs font-bold text-slate-900 leading-tight line-clamp-2" title={v.title}>
          {v.title}
        </h4>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1">
          <span className="font-mono font-bold text-primary-700 bg-indigo-50 px-1 py-0.2 rounded">
            #{v.orderIndex || 1}
          </span>
          {v.duration && v.duration !== 'N/A' && (
            <>
              <span>•</span>
              <span className="font-mono text-slate-400">{v.duration}</span>
            </>
          )}
        </div>
      </div>

      {/* Right: Watch Action Button */}
      <div className="shrink-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center hover:bg-primary-100 transition-colors"
          title="Watch lecture"
        >
          <Play className="w-3.5 h-3.5 fill-primary-600 ml-0.5" />
        </button>
      </div>
    </div>
  );
};
