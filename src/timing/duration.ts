/**
 * Calculates the display duration for a sentence based on reading speed.
 * Clamps the result between a minimum and maximum threshold to ensure readability.
 * @param sentence - The text string to evaluate.
 * @returns number - Duration in milliseconds.
 */
export function getDuration(sentence: string): number {
  const words = sentence.split(/\s+/).length;
  const wpm = 200; // Average adult reading speed

  // Convert words-per-minute to total milliseconds
  const time = (words / wpm) * 60 * 1000;

  // Clamp: 1.5s minimum (for short bursts) to 8s maximum (to prevent stagnation)
  return Math.min(Math.max(time, 1500), 8000);
}