import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Video,
  Play,
  BookOpen,
  Search,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  AlertCircle,
  ExternalLink,
  Layers,
  GraduationCap,
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
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';

export const LecturesPage = () => {
  const [searchParams] = useSearchParams();
  const initialSubjectId = searchParams.get('subjectId');

  const { userProfile, isProfileComplete } = useAuth();
  const studentClassId = userProfile?.classId;
  const studentStreamId = userProfile?.streamId;

  // State
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(initialSubjectId || '');
  const [chapters, setChapters] = useState([]);
  const [expandedChapterId, setExpandedChapterId] = useState(null);
  const [chapterVideos, setChapterVideos] = useState({}); // { [chapterId]: Video[] }

  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [loadingVideosForChapter, setLoadingVideosForChapter] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Video Player Modal
  const [activeVideo, setActiveVideo] = useState(null);

  // 1. Load subjects for student's class
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
          }
        }
      } catch (err) {
        console.error('Error fetching subjects:', err);
      } finally {
        if (isMounted) setLoadingSubjects(false);
      }
    };

    loadSubjects();
    return () => {
      isMounted = false;
    };
  }, [studentClassId, studentStreamId, initialSubjectId]);

  // 2. Load chapters when subject changes
  useEffect(() => {
    let isMounted = true;
    const loadChapters = async () => {
      if (!selectedSubjectId) {
        setChapters([]);
        return;
      }

      setLoadingChapters(true);
      try {
        const chaps = await fetchStudentChapters(selectedSubjectId);
        if (isMounted) {
          setChapters(chaps);
          if (chaps.length > 0) {
            // Auto expand the first chapter
            setExpandedChapterId(chaps[0].id);
          } else {
            setExpandedChapterId(null);
          }
        }
      } catch (err) {
        console.error('Error fetching chapters:', err);
      } finally {
        if (isMounted) setLoadingChapters(false);
      }
    };

    loadChapters();
    return () => {
      isMounted = false;
    };
  }, [selectedSubjectId]);

  // 3. Load videos when a chapter is expanded
  useEffect(() => {
    let isMounted = true;
    const loadVideos = async () => {
      if (!expandedChapterId || chapterVideos[expandedChapterId]) return;

      setLoadingVideosForChapter(expandedChapterId);
      try {
        const videos = await fetchStudentVideos(expandedChapterId);
        if (isMounted) {
          setChapterVideos((prev) => ({
            ...prev,
            [expandedChapterId]: videos,
          }));
        }
      } catch (err) {
        console.error('Error fetching videos for chapter:', err);
      } finally {
        if (isMounted) setLoadingVideosForChapter(null);
      }
    };

    loadVideos();
    return () => {
      isMounted = false;
    };
  }, [expandedChapterId, chapterVideos]);

  // 4. Handle Global Search within student's syllabus
  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchQuery(term);

    if (!term.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchStudentLectures(studentClassId, studentStreamId, term);
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const toggleChapterAccordion = (chapterId) => {
    setExpandedChapterId((prev) => (prev === chapterId ? null : chapterId));
  };

  // Active Subject Object
  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);

  // Active Video YouTube ID
  const activeYouTubeId = activeVideo ? (activeVideo.youtubeVideoId || extractYouTubeVideoId(activeVideo.videoUrl)) : null;

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
            You must select your academic class from your profile before you can access recorded video lectures.
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Recorded Lectures
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
            <span>Syllabus for</span>
            <span className="font-bold text-primary-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
              {userProfile.className} {userProfile.streamName ? `• ${userProfile.streamName}` : ''}
            </span>
          </p>
        </div>

        {/* Global Syllabus Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search topic or lecture..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[40px]"
          />
        </div>
      </div>

      {/* Search Results View */}
      {searchQuery.trim() ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Search Results ({searchResults.length})
            </h2>
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="text-xs text-primary-600 font-semibold hover:underline"
            >
              Clear Search
            </button>
          </div>

          {searchResults.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No matching lectures found"
              description={`No lectures found matching "${searchQuery}" in your syllabus.`}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {searchResults.map((video) => (
                <div
                  key={video.id}
                  onClick={() => setActiveVideo(video)}
                  className="student-card student-card-hover cursor-pointer p-3.5 flex flex-col justify-between space-y-3 group"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center">
                    <img
                      src={
                        video.thumbnailUrl ||
                        `https://img.youtube.com/vi/${video.youtubeVideoId || extractYouTubeVideoId(video.videoUrl)}/hqdefault.jpg`
                      }
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-900/30 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-primary-700 uppercase tracking-wider block truncate">
                      {video.subjectName} • {video.chapterName}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {video.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Normal Subject & Chapter View */
        <div className="space-y-5">
          {/* Subject Tabs */}
          {loadingSubjects ? (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 w-28 bg-slate-200 rounded-xl animate-pulse shrink-0" />
              ))}
            </div>
          ) : subjects.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No subjects available"
              description="No subjects have been mapped to your class yet."
            />
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {subjects.map((sub) => {
                const isSelected = sub.id === selectedSubjectId;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubjectId(sub.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer min-h-[44px] flex items-center gap-2 ${
                      isSelected
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <BookOpen className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    <span>{sub.subjectName}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Chapter Accordion List */}
          {loadingChapters ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-white border border-slate-200 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : chapters.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="No chapters found"
              description={`There are currently no chapters uploaded for ${currentSubject?.subjectName || 'this subject'}.`}
            />
          ) : (
            <div className="space-y-3">
              {chapters.map((chapter) => {
                const isExpanded = expandedChapterId === chapter.id;
                const videos = chapterVideos[chapter.id] || [];
                const isLoadingVideos = loadingVideosForChapter === chapter.id;

                return (
                  <div
                    key={chapter.id}
                    className="student-card p-0 overflow-hidden border-slate-200"
                  >
                    {/* Chapter Header Accordion Button */}
                    <button
                      type="button"
                      onClick={() => toggleChapterAccordion(chapter.id)}
                      className="w-full px-4 py-3.5 sm:px-5 sm:py-4 flex items-center justify-between gap-3 text-left hover:bg-slate-50/80 transition-colors cursor-pointer min-h-[52px]"
                      aria-expanded={isExpanded}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-primary-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {chapter.chapterNumber || '—'}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            Chapter {chapter.chapterNumber ? `${chapter.chapterNumber}: ` : ''}{chapter.name}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-slate-400 shrink-0">
                        <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
                          {videos.length > 0 ? `${videos.length} Lectures` : 'View Lectures'}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {/* Chapter Video Lectures Content */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-5">
                        {isLoadingVideos ? (
                          <SkeletonLoader variant="grid" rows={1} />
                        ) : videos.length === 0 ? (
                          <div className="text-center py-6 text-xs text-slate-500">
                            No recorded video lectures in this chapter yet.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            {videos.map((video, idx) => (
                              <div
                                key={video.id}
                                onClick={() => setActiveVideo(video)}
                                className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs hover:border-primary-300 hover:shadow-card cursor-pointer transition-all flex flex-col justify-between space-y-2.5 group"
                              >
                                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center">
                                  <img
                                    src={
                                      video.thumbnailUrl ||
                                      `https://img.youtube.com/vi/${video.youtubeVideoId || extractYouTubeVideoId(video.videoUrl)}/hqdefault.jpg`
                                    }
                                    alt={video.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                  <div className="absolute inset-0 bg-slate-900/30 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center">
                                    <div className="w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                      <Play className="w-4 h-4 fill-white ml-0.5" />
                                    </div>
                                  </div>
                                  {video.duration && (
                                    <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-1.5 py-0.5 rounded-md font-semibold">
                                      {video.duration}
                                    </div>
                                  )}
                                </div>

                                <div className="space-y-1">
                                  <span className="text-[10px] font-bold text-primary-700 uppercase tracking-wider block">
                                    Lecture {video.orderIndex || idx + 1}
                                  </span>
                                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                                    {video.title}
                                  </h4>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Video Player Modal */}
      <Modal
        isOpen={Boolean(activeVideo)}
        onClose={() => setActiveVideo(null)}
        title={activeVideo?.title}
        subtitle={`${activeVideo?.subjectName || ''} • ${activeVideo?.chapterName || ''}`}
        maxWidth="max-w-4xl"
      >
        {activeVideo && activeYouTubeId ? (
          <div className="space-y-4">
            {/* Embedded Secure YouTube Player */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeYouTubeId}?rel=0&modestbranding=1&autoplay=1`}
                title={activeVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Video Details */}
            {activeVideo.description && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-left">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Lecture Notes / Description
                </span>
                <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                  {activeVideo.description}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            Video stream is unavailable.
          </div>
        )}
      </Modal>
    </div>
  );
};
