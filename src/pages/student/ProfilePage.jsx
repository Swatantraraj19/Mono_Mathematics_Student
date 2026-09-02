import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  GraduationCap,
  Layers,
  Save,
  CheckCircle2,
  AlertCircle,
  Edit2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { fetchClasses, fetchStreams } from '../../services/lectureService';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const ProfilePage = () => {
  const { userProfile, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [classesList, setClassesList] = useState([]);
  const [streamsList, setStreamsList] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStreamId, setSelectedStreamId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Populate form with current user profile
  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setSelectedClassId(userProfile.classId || '');
      setSelectedStreamId(userProfile.streamId || '');
    }
  }, [userProfile]);

  // Load available classes and streams from Firestore
  useEffect(() => {
    let isMounted = true;
    const loadAcademicOptions = async () => {
      setLoadingOptions(true);
      try {
        const [classes, streams] = await Promise.all([
          fetchClasses(),
          fetchStreams(),
        ]);
        if (isMounted) {
          setClassesList(classes);
          setStreamsList(streams);
        }
      } catch (err) {
        console.error('Error fetching academic options:', err);
      } finally {
        if (isMounted) setLoadingOptions(false);
      }
    };

    loadAcademicOptions();
    return () => {
      isMounted = false;
    };
  }, []);

  // Determine if the selected class requires a stream (Classes 11 and 12)
  const currentSelectedClassObj = classesList.find((c) => c.id === selectedClassId);
  const requiresStream = Boolean(
    currentSelectedClassObj?.hasStreams ||
    currentSelectedClassObj?.name?.includes('11') ||
    currentSelectedClassObj?.name?.includes('12')
  );

  const handleClassChange = (e) => {
    const newClassId = e.target.value;
    setSelectedClassId(newClassId);

    const classObj = classesList.find((c) => c.id === newClassId);
    const needStream = Boolean(
      classObj?.hasStreams ||
      classObj?.name?.includes('11') ||
      classObj?.name?.includes('12')
    );

    // If changing to 6-10, clear stream
    if (!needStream) {
      setSelectedStreamId('');
    }

    if (errors.classId) setErrors((prev) => ({ ...prev, classId: null }));
  };

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Full Name is required.';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    } else if (!/^[a-zA-Z\s.']{2,50}$/.test(name.trim())) {
      newErrors.name = 'Please enter a valid name (letters only).';
    }

    if (!selectedClassId) {
      newErrors.classId = 'Please select your academic class.';
    }

    if (requiresStream && !selectedStreamId) {
      newErrors.streamId = 'Please select your stream (Science, Commerce, or Arts).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const classObj = classesList.find((c) => c.id === selectedClassId);
      const streamObj = streamsList.find((s) => s.id === selectedStreamId);

      await updateProfile({
        name: name.trim(),
        classId: selectedClassId,
        className: classObj?.name || null,
        streamId: requiresStream ? selectedStreamId : null,
        streamName: requiresStream ? (streamObj?.name || null) : null,
      });

      toast.success('Profile updated successfully.');
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      setName(userProfile.name || '');
      setSelectedClassId(userProfile.classId || '');
      setSelectedStreamId(userProfile.streamId || '');
    }
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            My Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your account and academic information.
          </p>
        </div>

        {!isEditing && (
          <Button
            variant="primary"
            size="sm"
            icon={Edit2}
            onClick={() => setIsEditing(true)}
            className="w-full sm:w-auto font-bold text-xs"
          >
            Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Overview Card */}
      <div className="student-card flex items-center justify-between gap-4 p-5 sm:p-6">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary-600 text-white font-extrabold text-xl sm:text-2xl flex items-center justify-center shadow-md shrink-0">
            {userProfile?.name?.charAt(0).toUpperCase() || 'S'}
          </div>
          <div className="space-y-1 min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">
              {userProfile?.name || 'Student'}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary" size="sm">
                Student
              </Badge>
              <Badge variant={userProfile?.status === 'active' ? 'active' : 'pending'} size="sm" dot>
                {userProfile?.status === 'active' ? 'Active' : 'Pending'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Form Card */}
      <div className="student-card p-6 sm:p-8">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Personal Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Full Name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                  }}
                  disabled={!isEditing || isSubmitting}
                  error={errors.name}
                  icon={User}
                  required
                />
              </div>

              <div>
                <Input
                  label="Email Address"
                  type="email"
                  value={userProfile?.email || ''}
                  disabled
                  helperText="Email address cannot be changed."
                  icon={Mail}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Academic Information */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5" />
              Academic Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Select
                  label="Academic Class"
                  value={selectedClassId}
                  onChange={handleClassChange}
                  disabled={!isEditing || isSubmitting || loadingOptions}
                  error={errors.classId}
                  placeholder={loadingOptions ? 'Loading classes...' : 'Select Class'}
                  options={classesList.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                  required
                />
              </div>

              {requiresStream && (
                <div className="animate-fadeIn">
                  <Select
                    label="Academic Stream"
                    value={selectedStreamId}
                    onChange={(e) => {
                      setSelectedStreamId(e.target.value);
                      if (errors.streamId) setErrors((prev) => ({ ...prev, streamId: null }));
                    }}
                    disabled={!isEditing || isSubmitting || loadingOptions}
                    error={errors.streamId}
                    placeholder={loadingOptions ? 'Loading streams...' : 'Select Stream'}
                    options={streamsList.map((s) => ({
                      value: s.id,
                      label: `${s.name} (${s.code || s.name})`,
                    }))}
                    required
                  />
                </div>
              )}
            </div>

            {requiresStream && (
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                <Layers className="w-3.5 h-3.5 text-primary-600" />
                Stream selection is mandatory for Class 11 and 12.
              </p>
            )}
          </div>

          {/* Form Actions (Only in Edit Mode) */}
          {isEditing && (
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 animate-fadeIn">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={X}
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={Save}
                isLoading={isSubmitting}
                disabled={isSubmitting}
                className="font-bold shadow-sm"
              >
                Save Changes
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
