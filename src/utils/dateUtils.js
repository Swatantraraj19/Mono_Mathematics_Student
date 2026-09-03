/**
 * Date and Time utilities for Mono Mathematics Student App.
 */

export const formatTimeDisplay = (timeStr) => {
  if (!timeStr) return '';
  try {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${String(formattedHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
  } catch {
    return timeStr;
  }
};

export const formatDateDisplay = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

export const computeLiveClassStatus = (liveClass) => {
  if (liveClass.manualStatus === 'cancelled' || liveClass.status === 'cancelled') {
    return 'cancelled';
  }

  if (liveClass.manualStatus === 'completed' || liveClass.status === 'completed') {
    return 'completed';
  }

  if (!liveClass.date || !liveClass.startTime) {
    return liveClass.status || 'upcoming';
  }

  try {
    const now = new Date();
    const [startHours, startMinutes] = (liveClass.startTime || '00:00').split(':').map(Number);
    const startDateTime = new Date(`${liveClass.date}T${String(startHours).padStart(2, '0')}:${String(startMinutes).padStart(2, '0')}:00`);

    const effectiveEndDate = liveClass.endDate || liveClass.date;
    let endDateTime;
    if (liveClass.endTime) {
      const [endHours, endMinutes] = liveClass.endTime.split(':').map(Number);
      endDateTime = new Date(`${effectiveEndDate}T${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}:00`);
    } else {
      endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
    }

    if (now < startDateTime) {
      return 'upcoming';
    } else if (now >= startDateTime && now <= endDateTime) {
      return 'live';
    } else {
      return 'completed';
    }
  } catch {
    return liveClass.status || 'upcoming';
  }
};
