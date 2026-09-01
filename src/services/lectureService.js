import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const INSTITUTE_ID = 'mono_math_01';

/**
 * YouTube URL Parser utility.
 */
export const extractYouTubeVideoId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = trimmed.match(regExp);

  if (match && match[2].length === 11) {
    return match[2];
  }

  return null;
};

/**
 * Fetch available academic classes for profile configuration.
 */
export const fetchClasses = async (instituteId = INSTITUTE_ID) => {
  try {
    const q = query(
      collection(db, 'classes'),
      where('instituteId', '==', instituteId),
      where('status', '==', 'active')
    );
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
    return list.sort((a, b) => (Number(a.orderIndex) || 0) - (Number(b.orderIndex) || 0));
  } catch (error) {
    console.error('Error fetching classes:', error);
    return [];
  }
};

/**
 * Fetch available streams for profile configuration.
 */
export const fetchStreams = async (instituteId = INSTITUTE_ID) => {
  try {
    const q = query(
      collection(db, 'streams'),
      where('instituteId', '==', instituteId),
      where('status', '==', 'active')
    );
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
    return list.sort((a, b) => (Number(a.orderIndex) || 0) - (Number(b.orderIndex) || 0));
  } catch (error) {
    console.error('Error fetching streams:', error);
    return [];
  }
};

/**
 * Fetch subjects mapped to the student's selected class (and stream for 11-12).
 */
export const fetchStudentSubjects = async (classId, streamId = null, instituteId = INSTITUTE_ID) => {
  if (!classId) return [];

  try {
    const q = query(
      collection(db, 'classSubjects'),
      where('instituteId', '==', instituteId),
      where('classId', '==', classId),
      where('status', '==', 'active')
    );
    const snapshot = await getDocs(q);
    let list = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    if (streamId) {
      list = list.filter((s) => !s.streamId || s.streamId === streamId);
    }

    return list.sort((a, b) => (a.subjectName || '').localeCompare(b.subjectName || ''));
  } catch (error) {
    console.error('Error fetching student subjects:', error);
    return [];
  }
};

/**
 * Fetch chapters strictly under a specific mapped subject.
 */
export const fetchStudentChapters = async (classSubjectId, instituteId = INSTITUTE_ID) => {
  if (!classSubjectId) return [];

  try {
    const q = query(
      collection(db, 'chapters'),
      where('instituteId', '==', instituteId),
      where('classSubjectId', '==', classSubjectId),
      where('status', '==', 'active')
    );
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    return list.sort(
      (a, b) =>
        (Number(a.chapterNumber) || Number(a.orderIndex) || 0) -
        (Number(b.chapterNumber) || Number(b.orderIndex) || 0)
    );
  } catch (error) {
    console.error('Error fetching student chapters:', error);
    return [];
  }
};

/**
 * Fetch recorded video lectures strictly under a specific chapter.
 */
export const fetchStudentVideos = async (chapterId, instituteId = INSTITUTE_ID) => {
  if (!chapterId) return [];

  try {
    const q = query(
      collection(db, 'videos'),
      where('instituteId', '==', instituteId),
      where('chapterId', '==', chapterId),
      where('status', '==', 'active')
    );
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    return list.sort((a, b) => (Number(a.orderIndex) || 0) - (Number(b.orderIndex) || 0));
  } catch (error) {
    console.error('Error fetching student videos:', error);
    return [];
  }
};

/**
 * Search video lectures within the student's enrolled syllabus.
 */
export const searchStudentLectures = async (classId, streamId = null, searchTerm = '', instituteId = INSTITUTE_ID) => {
  if (!classId || !searchTerm.trim()) return [];

  const term = searchTerm.trim().toLowerCase();

  try {
    const q = query(
      collection(db, 'videos'),
      where('instituteId', '==', instituteId),
      where('classId', '==', classId),
      where('status', '==', 'active')
    );
    const snapshot = await getDocs(q);
    let list = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    if (streamId) {
      list = list.filter((v) => !v.streamId || v.streamId === streamId);
    }

    return list.filter((v) => {
      const titleMatch = (v.title || '').toLowerCase().includes(term);
      const chapterMatch = (v.chapterName || '').toLowerCase().includes(term);
      const subjectMatch = (v.subjectName || '').toLowerCase().includes(term);
      return titleMatch || chapterMatch || subjectMatch;
    });
  } catch (error) {
    console.error('Error searching student lectures:', error);
    return [];
  }
};
