import { getDuration } from "../timing/duration";

/**
 * Ranks sentences by quality and returns the top 60% that pass the threshold.
 * @param sentences - Raw array of split sentences from the DOM.
 * @returns string[] - A curated subset that maintains original document order.
 */
export function curateSentences(sentences: string[]): string[] {
  const scored = sentences.map((s, i) => ({ 
    raw: s, 
    val: getScore(s),
    idx: i 
  })).filter(s => s.val > 0);

  const topCount = Math.ceil(scored.length * 0.6);
  
  return scored
    .sort((a, b) => b.val - a.val)
    .slice(0, topCount)
    .sort((a, b) => a.idx - b.idx)
    .map(s => s.raw);
}

/**
 * Heuristic engine to distinguish narrative content from UI noise.
 * Uses duration logic to penalize text that doesn't fit the 1.5s - 8s window.
 * @param s - The individual sentence string to evaluate.
 * @returns number - A weighted score; negative values indicate "junk" text.
 */
function getScore(s: string): number {
  const text = s.trim();
  const words = text.split(/\s+/).length;
  const duration = getDuration(text);

  // Filter out short fragments (e.g., "Menu", "Click here")
  if (text.length < 20) return -1;

  let points = 0;

  // Penalize "speed-reading" (more than 8s of text forced into the 8s clamp)
  const naturalReadingTime = (words / 200) * 60 * 1000;
  if (naturalReadingTime > 8500) {
    points -= 3; 
  } 
  // Reward the "sweet spot" (sentences lasting 3-6 seconds)
  else if (duration > 3000 && duration < 6000) {
    points += 3;
  }

  // Standard narrative markers
  if (words > 8) points += 2;
  if (/[.!?]$/.test(text)) points += 1;

  // Kill common web boilerplate
  if (/(home|menu|login|cookie|privacy|copyright|cart|search|click|read)/i.test(text)) {
    points -= 10;
  }

  // All-caps headers are usually ads or UI noise
  if (text === text.toUpperCase() && text.length > 10) points -= 5;

  return points;
}