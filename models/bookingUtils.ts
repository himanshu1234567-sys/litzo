// models/bookingUtils.ts

// Convert "05:30 PM" → minutes
export function timeToMinutes(time: string): number {
  const [t, meridian] = time.split(" ");
  let [h, m] = t.split(":").map(Number);

  if (meridian === "PM" && h !== 12) h += 12;
  if (meridian === "AM" && h === 12) h = 0;

  return h * 60 + m;
}

// Calculate end time based on duration
export function calculateEndTime(
  startTime: string,
  duration: number
): string {
  const minutes = timeToMinutes(startTime) + duration;

  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const ampm = h >= 12 ? "PM" : "AM";

  return `${hour12}:${m === 0 ? "00" : m} ${ampm}`;
}

// Check overlapping slots
export function isOverlapping(
  startA: number,
  endA: number,
  startB: number,
  endB: number
): boolean {
  return startA < endB && startB < endA;
}
