
/**
 * Calculates the Levenshtein distance between two strings.
 * Used to measure how many edits (insertions, deletions, substitutions) 
 * are needed to change one string into another.
 */
const getLevenshteinDistance = (a: string, b: string): number => {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return matrix[a.length][b.length];
};

/**
 * Performs a fuzzy match between a query and a target text.
 * Returns true if the query is found within the text or matches a part of it with a small error margin.
 */
export const fuzzySearch = (query: string, text: string): boolean => {
  const q = query.toLowerCase().trim();
  const t = text.toLowerCase().trim();

  if (!q) return true;
  if (!t) return false;

  // 1. Direct match or standard includes (fast path)
  if (t.includes(q)) return true;

  // 2. Fuzzy match logic for typos
  const words = t.split(/\s+/);
  
  // Define tolerance based on query length
  // 0 typos for <=3 chars, 1 typo for 4-6 chars, 2 typos for >6 chars
  const maxDist = q.length <= 3 ? 0 : q.length <= 6 ? 1 : 2;

  return words.some(word => {
    // Check if the query is a typo-tolerant version of the word (or its prefix)
    const wordSlice = word.substring(0, q.length + 1);
    const distance = getLevenshteinDistance(q, wordSlice);
    
    return distance <= maxDist;
  });
};
