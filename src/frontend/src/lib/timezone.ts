
import { format, parseISO, isValid, addDays, startOfDay, endOfDay, isAfter, isBefore, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';

// Vietnam timezone configuration
export const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';

// Get current time in Vietnam timezone
export function getCurrentTimeInVietnam(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: VIETNAM_TIMEZONE }));
}

// Format date for Vietnamese users
export function formatDateVN(date: string | Date, formatString: string = 'dd/MM/yyyy'): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Ngày không hợp lệ';
    
    return format(dateObj, formatString, { locale: vi });
  } catch (error) {
    return 'Ngày không hợp lệ';
  }
}

// Format datetime for Vietnamese users
export function formatDateTimeVN(date: string | Date): string {
  return formatDateVN(date, 'dd/MM/yyyy HH:mm');
}

// Get relative time string in Vietnamese
export function getRelativeTimeVN(date: string | Date): string {
  try {
    const targetDate = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(targetDate)) return 'Ngày không hợp lệ';
    
    const now = getCurrentTimeInVietnam();
    const diffDays = differenceInDays(targetDate, now);
    
    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Ngày mai';
    if (diffDays === -1) return 'Hôm qua';
    if (diffDays > 1) return `${diffDays} ngày nữa`;
    if (diffDays < -1) return `${Math.abs(diffDays)} ngày trước`;
    
    return formatDateVN(targetDate);
  } catch (error) {
    return 'Ngày không hợp lệ';
  }
}

// Check if date is overdue
export function isOverdue(deadline: string | Date): boolean {
  try {
    const deadlineDate = typeof deadline === 'string' ? parseISO(deadline) : deadline;
    if (!isValid(deadlineDate)) return false;
    
    const now = getCurrentTimeInVietnam();
    return isBefore(deadlineDate, now);
  } catch (error) {
    return false;
  }
}

// Check if date is today
export function isToday(date: string | Date): boolean {
  try {
    const targetDate = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(targetDate)) return false;
    
    const now = getCurrentTimeInVietnam();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    
    return isAfter(targetDate, todayStart) && isBefore(targetDate, todayEnd);
  } catch (error) {
    return false;
  }
}

// Check if date is upcoming (within next 3 days)
export function isUpcoming(deadline: string | Date): boolean {
  try {
    const deadlineDate = typeof deadline === 'string' ? parseISO(deadline) : deadline;
    if (!isValid(deadlineDate)) return false;
    
    const now = getCurrentTimeInVietnam();
    const threeDaysFromNow = addDays(now, 3);
    
    return isAfter(deadlineDate, now) && isBefore(deadlineDate, threeDaysFromNow);
  } catch (error) {
    return false;
  }
}

// Convert ISO date to Vietnam timezone
export function toVietnamTimezone(date: string | Date): Date {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return new Date();
    
    return new Date(dateObj.toLocaleString('en-US', { timeZone: VIETNAM_TIMEZONE }));
  } catch (error) {
    return new Date();
  }
}

// Format duration in Vietnamese
export function formatDurationVN(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} phút`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} giờ`;
  }
  
  return `${hours} giờ ${remainingMinutes} phút`;
}
