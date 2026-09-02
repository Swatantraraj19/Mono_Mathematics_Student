import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const INSTITUTE_ID = 'mono_math_01';
const SETTINGS_COLLECTION = 'app_settings';
const USERS_COLLECTION = 'users';

export const authService = {
  /**
   * Fetch current global access mode ('open' vs 'approval').
   */
  async fetchAccessMode(instituteId = INSTITUTE_ID) {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, `${instituteId}_access`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data().accessMode || 'open';
      }
      return 'open';
    } catch {
      return 'open';
    }
  },

  /**
   * Fetch student user document from Firestore.
   */
  async fetchStudentProfile(uid) {
    if (!uid) return null;
    const docRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return {
      id: docSnap.id,
      ...docSnap.data(),
    };
  },

  /**
   * Student Login with role and status verification.
   */
  async login(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const uid = userCredential.user.uid;

    try {
      let profile = await this.fetchStudentProfile(uid);

      // Auto-heal / self-recovery if profile was deleted from Firestore but Auth account exists
      if (!profile) {
        const accessMode = await this.fetchAccessMode(INSTITUTE_ID);
        const initialStatus = accessMode === 'approval' ? 'pending' : 'active';

        const studentData = {
          uid,
          name: userCredential.user.displayName || email.split('@')[0],
          email: email.trim().toLowerCase(),
          role: 'student',
          status: initialStatus,
          instituteId: INSTITUTE_ID,
          classId: null,
          className: null,
          streamId: null,
          streamName: null,
          photoURL: userCredential.user.photoURL || null,
          registeredAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        const userDocRef = doc(db, USERS_COLLECTION, uid);
        await setDoc(userDocRef, studentData);
        profile = { id: uid, ...studentData };
      }

      if (profile.role !== 'student') {
        throw new Error('Access denied: This portal is exclusively for students.');
      }

      return {
        user: userCredential.user,
        profile,
      };
    } catch (err) {
      if (err.message.includes('Access denied')) {
        await signOut(auth);
      }
      throw err;
    }
  },

  /**
   * Student Login / Signup with Google OAuth Popup.
   */
  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    const uid = user.uid;

    try {
      let profile = await this.fetchStudentProfile(uid);

      // If first-time Google signin, initialize student record in Firestore
      if (!profile) {
        const accessMode = await this.fetchAccessMode(INSTITUTE_ID);
        const initialStatus = accessMode === 'approval' ? 'pending' : 'active';

        const studentData = {
          uid,
          name: user.displayName || 'Student',
          email: user.email ? user.email.toLowerCase() : '',
          role: 'student',
          status: initialStatus,
          instituteId: INSTITUTE_ID,
          classId: null,
          className: null,
          streamId: null,
          streamName: null,
          photoURL: user.photoURL || null,
          registeredAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        const userDocRef = doc(db, USERS_COLLECTION, uid);
        await setDoc(userDocRef, studentData);
        profile = { id: uid, ...studentData };
      }

      if (profile.role !== 'student') {
        throw new Error('Access denied: This portal is exclusively for students.');
      }

      return {
        user,
        profile,
      };
    } catch (err) {
      if (err.message.includes('Access denied')) {
        await signOut(auth);
      }
      throw err;
    }
  },

  /**
   * Student Registration with dynamic Access Mode handling.
   */
  async signup({ name, email, password }) {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Fetch current access mode to determine initial status
    const accessMode = await this.fetchAccessMode(INSTITUTE_ID);
    const initialStatus = accessMode === 'approval' ? 'pending' : 'active';

    // 2. Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
    const uid = userCredential.user.uid;

    // 3. Create student document in Firestore users/{uid}
    const studentData = {
      uid,
      name: trimmedName,
      email: trimmedEmail,
      role: 'student',
      status: initialStatus,
      instituteId: INSTITUTE_ID,
      classId: null,
      className: null,
      streamId: null,
      streamName: null,
      photoURL: null,
      registeredAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const userDocRef = doc(db, USERS_COLLECTION, uid);
    await setDoc(userDocRef, studentData);

    return {
      user: userCredential.user,
      profile: { id: uid, ...studentData },
      accessMode,
    };
  },

  /**
   * Send Password Reset Email.
   */
  async sendPasswordReset(email) {
    if (!email || !email.trim()) {
      throw new Error('Please enter your registered email address.');
    }
    return sendPasswordResetEmail(auth, email.trim());
  },

  /**
   * Update Student Profile (Personal + Academic Information).
   */
  async updateProfile(uid, { name, classId, className, streamId, streamName }) {
    if (!uid) throw new Error('User ID required.');

    const docRef = doc(db, USERS_COLLECTION, uid);
    const updatePayload = {
      name: name.trim(),
      classId: classId || null,
      className: className || null,
      streamId: streamId || null,
      streamName: streamName || null,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(docRef, updatePayload);
    return updatePayload;
  },

  /**
   * Logout.
   */
  async logout() {
    return signOut(auth);
  },
};
