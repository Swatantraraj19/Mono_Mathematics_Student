import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { computeLiveClassStatus } from '../utils/dateUtils';

const INSTITUTE_ID = 'mono_math_01';
const LIVE_CLASSES_COLLECTION = 'liveClasses';

/**
 * Fetch live classes strictly filtered for the student's assigned class and stream.
 */
export const fetchStudentLiveClasses = async (classId, streamId = null, instituteId = INSTITUTE_ID) => {
  if (!classId) return [];

  try {
    const q = query(
      collection(db, LIVE_CLASSES_COLLECTION),
      where('instituteId', '==', instituteId),
      where('classId', '==', classId)
    );

    const snapshot = await getDocs(q);
    let list = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      const currentStatus = computeLiveClassStatus(data);
      return {
        id: docSnap.id,
        ...data,
        computedStatus: currentStatus,
      };
    });

    // Stream filter for Class 11 and 12
    if (streamId) {
      list = list.filter((item) => !item.streamId || item.streamId === streamId);
    }

    // Sort by status priority: live (1) -> upcoming (2) -> completed (3) -> cancelled (4)
    return list.sort((a, b) => {
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
  } catch (error) {
    console.error('Error fetching student live classes:', error);
    return [];
  }
};
