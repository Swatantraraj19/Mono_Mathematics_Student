import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Video,
  Play,
  Search,
  Clock,
  X,
  RefreshCw,
  Maximize,
  Minimize,
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

  // In-App Video Player State (Exact Admin Panel Implementation)
  const [playingVideo, setPlayingVideo] = useState(null);
  const playerContainerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleCustomFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Load subjects mapped to student's class and stream
  const loadSubjects = useCallback(async () => {
    if (!studentClassId) {
      setLoadingSubjects(false);
      return;
    }

    setLoadingSubjects(true);
    try {
      const subs = await fetchStudentSubjects(studentClassId, studentStreamId);
      setSubjects(subs);
      if (subs.length > 0) {
        const matched = subs.find((s) => s.id === initialSubjectId);
        setSelectedSubjectId(matched ? matched.id : subs[0].id);
      } else {
        setSelectedSubjectId('');
      }
    } catch (err) {
      console.error('Error fetching student subjects:', err);
    } finally {
      setLoadingSubjects(false);
    }
  }, [studentClassId, studentStreamId, initialSubjectId]);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  // Load chapters whenever selected subject changes
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

  // Load videos whenever selected chapter changes (uses in-memory cache)
  useEffect(() => {
    let isMounted = true;
    const loadVideos = async () => {
      if (!selectedChapterId) return;

      if (chapterVideos[selectedChapterId]) return; // Cache hit

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

  // Search Input with debounce
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
      <div className="space-y-4 animate-fadeIn select-none">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Recorded Lectures
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Access your chapter-wise syllabus and video lectures.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-3 max-w-md mx-auto my-6">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-amber-900">
            Profile Completion Required
          </h2>
          <p className="text-xs text-amber-700 max-w-xs mx-auto leading-relaxed">
            Please select your academic class in Profile to unlock recorded lectures.
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
    <div className="space-y-2.5 sm:space-y-3 animate-fadeIn select-none">
      {/* 1. Page Title Header (Clean and Compact matching Admin) */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Recorded Lectures
        </h1>
        <div className="flex items-center gap-1.5 mt-0.5 text-[13px] text-slate-500">
          <span>Syllabus for</span>
          <span className="font-bold text-primary-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-[11px]">
            {userProfile?.className || 'Class'}
            {userProfile?.streamName ? ` • ${userProfile.streamName}` : ''}
          </span>
        </div>
      </div>

      {/* 2. Control Card: Search + Selectors + Summary (EXACT ADMIN PANEL LAYOUT & SIZING) */}
      <div className="bg-white border border-slate-200/80 rounded-xl !p-2.5 sm:!p-4 space-y-2 sm:space-y-3 shadow-xs">
        {/* Top Control Row: Search & Refresh */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search all video lectures across syllabus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-[13px] py-1.5 sm:py-2 pl-8 pr-8 sm:pr-11 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              aria-label="Search Videos"
            />
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-0 top-0 bottom-0 w-8 sm:w-10 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              loadSubjects();
              if (selectedChapterId) {
                setChapterVideos((prev) => {
                  const updated = { ...prev };
                  delete updated[selectedChapterId];
                  return updated;
                });
              }
            }}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-primary-600 hover:bg-slate-50 transition-colors shrink-0 cursor-pointer"
            title="Refresh lectures data"
            aria-label="Refresh lectures data"
          >
            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Academic Selectors: Subject -> Chapter (Only 2 options) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 pt-1.5 sm:pt-2 border-t border-slate-100">
          {/* Subject Selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5 sm:mb-1">
              Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              disabled={loadingSubjects || subjects.length === 0}
              className="w-full text-[13px] py-1.5 sm:py-2 px-2.5 bg-slate-50/70 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
              aria-label="Select Subject"
            >
              {loadingSubjects ? (
                <option value="">Loading subjects...</option>
              ) : subjects.length === 0 ? (
                <option value="">No subjects</option>
              ) : (
                subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.subjectName}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Chapter Selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5 sm:mb-1">
              Chapter
            </label>
            <select
              value={selectedChapterId}
              onChange={(e) => setSelectedChapterId(e.target.value)}
              disabled={loadingChapters || chapters.length === 0}
              className="w-full text-[13px] py-1.5 sm:py-2 px-2.5 bg-indigo-50/30 text-indigo-900 border border-indigo-200 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Select Chapter"
            >
              {loadingChapters ? (
                <option value="">Loading chapters...</option>
              ) : chapters.length === 0 ? (
                <option value="">No chapters in this subject</option>
              ) : (
                chapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    #{ch.chapterNumber} {ch.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Compact Result Summary Line (Admin exact match) */}
        {!loadingSubjects && (
          <div className="pt-1.5 sm:pt-2 border-t border-slate-100 flex items-center justify-between text-[13px] text-slate-600 flex-wrap gap-1">
            {searchQuery.trim() ? (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0"></span>
                <span>
                  Search for "<strong>{searchQuery.trim()}</strong>":
                </span>
                <span className="font-semibold text-primary-700 bg-primary-50 px-2 py-0.2 rounded text-[11px]">
                  {searchResults.length} matching lecture{searchResults.length !== 1 ? 's' : ''}
                </span>
              </span>
            ) : selectedChapterId && activeChapterObj ? (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="text-slate-700 font-medium">
                  {currentChapterVideos.length} lecture{currentChapterVideos.length !== 1 ? 's' : ''} in this chapter
                </span>
                <span className="text-slate-400 hidden sm:inline">•</span>
                <span className="text-slate-400 hidden sm:inline text-[11px]">
                  Ch #{activeChapterObj.chapterNumber} {activeChapterObj.name}
                </span>
              </span>
            ) : (
              <span className="text-slate-400 text-[12px]">Select a chapter above to view lectures</span>
            )}

            {searchQuery.trim() && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[11px] font-semibold text-primary-600 hover:text-primary-800 hover:underline cursor-pointer"
              >
                Back to chapter view
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. Main Content: Video Lectures Area */}
      {loadingSubjects || loadingChapters ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-slate-200/80 rounded-xl !p-2 flex items-center gap-2.5 animate-pulse shadow-2xs">
              <div className="w-16 h-10 bg-slate-200 rounded-md shrink-0"></div>
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                <div className="h-2.5 bg-slate-100 rounded w-1/4"></div>
              </div>
              <div className="w-6 h-6 bg-slate-100 rounded shrink-0"></div>
            </div>
          ))}
        </div>
      ) : searchQuery.trim() ? (
        /* ======================== GLOBAL SEARCH VIEW ======================== */
        <div>
          {isSearching ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-slate-200/80 rounded-xl !p-2 flex items-center gap-2.5 animate-pulse shadow-2xs">
                  <div className="w-16 h-10 bg-slate-200 rounded-md shrink-0"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-2.5 bg-slate-100 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No Matching Lectures Found"
              description={`No lectures found matching "${searchQuery}". Try another keyword or topic.`}
              actionLabel="Clear Search"
              onAction={() => setSearchQuery('')}
            />
          ) : (
            renderVideoList(searchResults, setPlayingVideo)
          )}
        </div>
      ) : (
        /* ======================== CHAPTER-SCOPED VIEW ======================== */
        <div>
          {loadingVideos ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-slate-200/80 rounded-xl !p-2 flex items-center gap-2.5 animate-pulse shadow-2xs">
                  <div className="w-16 h-10 bg-slate-200 rounded-md shrink-0"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-2.5 bg-slate-100 rounded w-1/4"></div>
                  </div>
                  <div className="w-6 h-6 bg-slate-100 rounded shrink-0"></div>
                </div>
              ))}
            </div>
          ) : !selectedChapterId ? (
            <EmptyState
              icon={Video}
              title="No Chapter Selected"
              description="Please select a subject and chapter above to view recorded lectures."
            />
          ) : currentChapterVideos.length === 0 ? (
            <EmptyState
              icon={Video}
              title="No Lectures Added Yet"
              description={`No video lectures have been uploaded for "${activeChapterObj?.name || 'this chapter'}" yet.`}
            />
          ) : (
            renderVideoList(currentChapterVideos, setPlayingVideo)
          )}
        </div>
      )}

      {/* In-App Video Player Modal (EXACT ADMIN PANEL IMPLEMENTATION WITH SECURITY OVERLAYS) */}
      {playingVideo && (
        <Modal
          isOpen={Boolean(playingVideo)}
          onClose={() => setPlayingVideo(null)}
          title={playingVideo.title}
          subtitle={`${playingVideo.className || userProfile?.className || ''} • ${playingVideo.subjectName || activeSubjectObj?.subjectName || ''} • Chapter: ${playingVideo.chapterName || activeChapterObj?.name || ''}`}
          maxWidth="max-w-2xl"
          closeOnBackdropClick={false}
        >
          {/* Modal Header Bar Controls */}
          <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500">
              Lecture Video Player
            </span>
            <button
              type="button"
              onClick={toggleCustomFullscreen}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              {isFullscreen ? (
                <>
                  <Minimize className="w-3.5 h-3.5 text-primary-400" />
                  <span>Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize className="w-3.5 h-3.5 text-primary-400" />
                  <span>Full Screen</span>
                </>
              )}
            </button>
          </div>

          <div
            ref={playerContainerRef}
            className="relative aspect-video w-full bg-black rounded-xl overflow-hidden shadow-lg border border-slate-800 select-none flex items-center justify-center"
          >
            <iframe
              src={`https://www.youtube.com/embed/${playingVideo.youtubeVideoId || extractYouTubeVideoId(playingVideo.videoUrl)}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`}
              title={playingVideo.title}
              className="w-full h-full border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            />

            {/* Percentage-Based Top Left Overlay: Mobile ke liye 75% width & 26% height, Desktop ke liye exact 70% width & 17% height */}
            <div
              className={`absolute top-0 left-0 z-20 pointer-events-auto bg-transparent cursor-default select-none ${
                isFullscreen ? 'w-[70%] h-[18%] sm:h-[17%]' : 'w-[55%] sm:w-[70%] h-[30%] sm:h-[17%]'
              }`}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            />

            {/* Floating Exit Fullscreen Button (Appears ONLY in Fullscreen mode at Top Center, keeping Settings Gear 100% visible) */}
            {isFullscreen && (
              <button
                type="button"
                onClick={toggleCustomFullscreen}
                className="absolute top-2.5 left-2.5 sm:top-4 sm:left-1/2 sm:-translate-x-1/2 z-40 inline-flex items-center gap-1 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-slate-900/90 hover:bg-black text-white text-[11px] sm:text-xs font-semibold shadow-xl border border-slate-700 transition-all cursor-pointer backdrop-blur-md pointer-events-auto"
                title="Exit Fullscreen"
              >
                <Minimize className="w-4 h-4 text-primary-400" />
                <span>Exit Fullscreen</span>
              </button>
            )}

            {/* Dynamic State-Aware Bottom Overlay: Auto-calibrates height for Mobile Normal (30px), Mobile Fullscreen (42px), Desktop Normal (52px), and Desktop Fullscreen (64px) */}
            <div
              className={`absolute bottom-0 left-0 right-0 z-30 pointer-events-auto bg-transparent cursor-default select-none ${
                isFullscreen ? 'h-[58px] sm:h-[64px]' : 'h-[45px] sm:h-[64px]'
              }`}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

/**
 * Render Video List:
 * - Mobile (< 640px): High-Density Compact Cards (EXACT ADMIN PANEL LAYOUT & SIZING)
 * - Desktop (>= 640px): High-Density Table (EXACT ADMIN PANEL LAYOUT & SIZING)
 */
const renderVideoList = (videos, onPlay) => {
  return (
    <>
      {/* 1. Mobile High-Density Compact Cards (< 640px) - EXACT ADMIN PANEL MATCH */}
      <div className="grid grid-cols-1 gap-1.5 sm:hidden">
        {videos.map((v) => {
          const ytId = v.youtubeVideoId || extractYouTubeVideoId(v.videoUrl);
          const thumb = v.thumbnailUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null);

          return (
            <div
              key={v.id}
              className="bg-white border border-slate-200/80 rounded-xl !p-2 flex items-center justify-between gap-2 hover:border-primary-200 transition-colors shadow-2xs"
            >
              {/* Left: Thumbnail with Click-to-play */}
              <div
                onClick={() => onPlay(v)}
                className="relative w-16 h-10 rounded-md bg-slate-900 overflow-hidden shrink-0 group cursor-pointer border border-slate-200 shadow-2xs"
                title="Click to preview lecture"
              >
                {thumb ? (
                  <img
                    src={thumb}
                    alt={v.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
                    <Video className="w-4 h-4" />
                  </div>
                )}
                <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center">
                  <Play className="w-3 h-3 text-white fill-white" />
                </div>
              </div>

              {/* Middle: Title & Meta */}
              <div className="min-w-0 flex-1">
                <h4
                  onClick={() => onPlay(v)}
                  className="text-[13px] font-bold text-slate-900 leading-tight truncate cursor-pointer hover:text-primary-600 transition-colors"
                  title={v.title}
                >
                  {v.title}
                </h4>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                  <span className="font-mono font-bold text-primary-700 bg-indigo-50 px-1.5 py-0.2 rounded text-[11px]">
                    #{v.orderIndex || 1}
                  </span>
                  <span>•</span>
                  <span className="text-emerald-600 font-medium text-[11px]">
                    Active
                  </span>
                  {v.duration && v.duration !== 'N/A' && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-slate-400 text-[11px]">{v.duration}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onPlay(v)}
                  className="p-1.5 rounded-md text-primary-600 hover:bg-primary-50 active:bg-primary-100 cursor-pointer"
                  title="Watch Lecture"
                  aria-label="Watch lecture"
                >
                  <Play className="w-3.5 h-3.5 fill-primary-600" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Desktop High-Density Table (>= 640px) - EXACT ADMIN PANEL MATCH */}
      <div className="hidden sm:block w-full overflow-hidden bg-white border border-slate-200/80 rounded-xl shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3 w-16">L #</th>
                <th className="py-2.5 px-3 w-24">Preview</th>
                <th className="py-2.5 px-3">Lecture Title</th>
                <th className="py-2.5 px-3 w-28">Duration</th>
                <th className="py-2.5 px-3 w-24">Status</th>
                <th className="py-2.5 px-3 text-right w-24 pr-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {videos.map((v) => {
                const ytId = v.youtubeVideoId || extractYouTubeVideoId(v.videoUrl);
                const thumb = v.thumbnailUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null);

                return (
                  <tr key={v.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2 px-3">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 bg-indigo-50 text-primary-700 rounded-md">
                        #{v.orderIndex || 1}
                      </span>
                    </td>

                    <td className="py-2 px-3">
                      <div
                        onClick={() => onPlay(v)}
                        className="relative w-16 h-10 rounded-md bg-slate-900 overflow-hidden shrink-0 group cursor-pointer border border-slate-200 shadow-2xs"
                        title="Click to watch lecture"
                      >
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={v.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
                            <Video className="w-4 h-4" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center group-hover:bg-slate-900/10 transition-colors">
                          <Play className="w-3.5 h-3.5 text-white fill-white" />
                        </div>
                      </div>
                    </td>

                    <td className="py-2 px-3">
                      <span
                        onClick={() => onPlay(v)}
                        className="text-sm font-bold text-slate-900 hover:text-primary-600 transition-colors cursor-pointer block leading-snug"
                        title={v.title}
                      >
                        {v.title}
                      </span>
                      {v.chapterName && (
                        <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                          {v.subjectName ? `${v.subjectName} • ` : ''}{v.chapterName}
                        </span>
                      )}
                    </td>

                    <td className="py-2 px-3">
                      <span className="inline-flex items-center gap-1 text-[13px] font-mono text-slate-600 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {v.duration && v.duration !== 'N/A' ? v.duration : 'N/A'}
                      </span>
                    </td>

                    <td className="py-2 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </span>
                    </td>

                    <td className="py-2 px-3 text-right pr-4">
                      <button
                        type="button"
                        onClick={() => onPlay(v)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-primary-700" />
                        Watch
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
