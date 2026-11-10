/** 965 → «16:05». Minutter over 59 vises som de er («72:00»). */
export function formatClock(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

/** Klokkeslett som «18:42». */
export function formatTimeOfDay(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
}
