import type { Session } from './store';

const DAY = 24 * 60 * 60 * 1000;

export function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function dayKey(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/** Consecutive days (ending today or yesterday) with at least one session. */
export function streak(sessions: Session[], now = Date.now()) {
  const days = new Set(sessions.map((s) => dayKey(s.startedAt)));
  let cursor = startOfDay(now);
  if (!days.has(dayKey(cursor))) cursor -= DAY; // streak still alive if you trained yesterday
  let count = 0;
  while (days.has(dayKey(cursor))) {
    count++;
    cursor -= DAY;
  }
  return count;
}

export function minutesOn(sessions: Session[], dayStart: number) {
  const end = dayStart + DAY;
  const sec = sessions
    .filter((s) => s.startedAt >= dayStart && s.startedAt < end)
    .reduce((sum, s) => sum + s.durationSec, 0);
  return sec / 60;
}

/** Minutes trained for each of the last `n` days, oldest first. */
export function lastNDays(sessions: Session[], n = 7, now = Date.now()) {
  const today = startOfDay(now);
  return Array.from({ length: n }, (_, i) => {
    const start = today - (n - 1 - i) * DAY;
    return { start, minutes: minutesOn(sessions, start) };
  });
}

export function successRate(successes: number, misses: number) {
  const total = successes + misses;
  return total === 0 ? null : Math.round((successes / total) * 100);
}

export function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatMinutes(min: number) {
  if (min < 1 && min > 0) return '<1 min';
  return `${Math.round(min)} min`;
}

export function relativeDay(ts: number, now = Date.now()) {
  const diff = Math.round((startOfDay(now) - startOfDay(ts)) / DAY);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return new Date(ts).toLocaleDateString(undefined, { weekday: 'long' });
  return new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}
