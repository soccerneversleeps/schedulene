import { TimeSlot } from '../types/appointment';

export const TIME_SLOTS: TimeSlot[] = ['8-10 AM', '10-12 PM', '1-3 PM', '3-5 PM'];

export function getWeekDates(date: Date = new Date()): Date[] {
  const current = new Date(date);
  const week = [];
  
  // Get to the start of the week (Sunday)
  current.setDate(current.getDate() - current.getDay());
  
  // Generate array of dates for the week
  for (let i = 0; i < 7; i++) {
    week.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return week;
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

export function getNextWeek(date: Date): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + 7);
  return next;
}

export function getPreviousWeek(date: Date): Date {
  const prev = new Date(date);
  prev.setDate(prev.getDate() - 7);
  return prev;
} 