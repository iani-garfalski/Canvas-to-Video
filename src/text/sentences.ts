/**
 * Breaks a raw string into an array of sentences using basic punctuation boundaries.
 * @param text - The raw extracted DOM text.
 * @returns string[] - Array of captured sentences or empty array if no matches.
 */
export function splitIntoSentences(text: string): string[] {
  // Normalize whitespace first, then split by terminal punctuation
  return text.replace(/\s+/g, " ").match(/[^.!?]+[.!?]+/g) || [];
}