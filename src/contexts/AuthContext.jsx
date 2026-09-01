import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authStatus, setAuthStatus] = useState('checking'); // 'checking' | 'active' | 'pending' | 'inactive' | 'unauthenticated' | 'error'
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    let unsubscribeUserDoc = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
        unsubscribeUserDoc = null;
      }

      if (currentUser) {
        setUser(currentUser);
        try {
          // Listen in real-time to the student document for instant status changes
          const userDocRef = doc(db, 'users', currentUser.uid);
          
          unsubscribeUserDoc = onSnapshot(
            userDocRef,
            (docSnap) => {
              if (docSnap.exists()) {
                const profile = { id: docSnap.id, ...docSnap.data() };
                setUserProfile(profile);

                if (profile.role !== 'student') {
                  setAuthStatus('unauthenticated');
                  setErrorMessage('Only students are authorized to access this platform.');
                  authService.logout();
                } else if (profile.status === 'active') {
                  setAuthStatus('active');
                  setErrorMessage(null);
                } else if (profile.status === 'pending') {
                  setAuthStatus('pending');
                  setErrorMessage(null);
                } else if (profile.status === 'inactive') {
                  setAuthStatus('inactive');
                  setErrorMessage(null);
                } else {
                  setAuthStatus('active'); // fallback
                }
              } else {
                // If auth exists but no student profile in Firestore
                setUserProfile(null);
                setAuthStatus('unauthenticated');
              }
            },
            (error) => {
              console.error('Real-time profile listener error:', error);
              setAuthStatus('error');
              setErrorMessage('Failed to sync student session. Please check your internet connection.');
            }
          );
        } catch (err) {
          console.error('Auth verification error:', err);
          setAuthStatus('error');
          setErrorMessage('Unable to verify account status.');
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setAuthStatus('unauthenticated');
        setErrorMessage(null);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
  }, []);

  const login = async (email, password) => {
    setAuthStatus('checking');
    try {
      const result = await authService.login(email, password);
      setUser(result.user);
      setUserProfile(result.profile);
      return result;
    } catch (err) {
      setAuthStatus('unauthenticated');
      throw err;
    }
  };

  const signup = async (data) => {
    setAuthStatus('checking');
    try {
      const result = await authService.signup(data);
      setUser(result.user);
      setUserProfile(result.profile);
      return result;
    } catch (err) {
      setAuthStatus('unauthenticated');
      throw err;
    }
  };

  const updateProfile = async (academicData) => {
    if (!user) throw new Error('Not authenticated');
    await authService.updateProfile(user.uid, academicData);
    setUserProfile((prev) => ({
      ...prev,
      ...academicData,
    }));
  };

  const logout = async () => {
    setAuthStatus('unauthenticated');
    await authService.logout();
    setUser(null);
    setUserProfile(null);
  };

  const isProfileComplete = Boolean(
    userProfile?.classId &&
    (!userProfile.className?.includes('11') && !userProfile.className?.includes('12')
      ? true
      : Boolean(userProfile.streamId))
  );

  const value = {
    user,
    userProfile,
    authStatus,
    errorMessage,
    login,
    signup,
    logout,
    updateProfile,
    isProfileComplete,
    isAuthenticated: Boolean(user) && authStatus === 'active',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
