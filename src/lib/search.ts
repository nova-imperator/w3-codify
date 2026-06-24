/**
 * Lightweight course-search relevance (shared FE + BE).
 *
 * The bug: searching "testing" returned Cyber Security because its tag
 * "Pentesting" contains the substring "testing". For short queries a mid-word
 * substring is too loose — "testing" should not match "Pen[testing]".
 *
 * Rule of thumb:
 *  - Title / tag / instructor matches always count (these are the signal).
 *  - For SHORT queries (≤ 4 chars, e.g. "ai", "ml", "k8s") and for the blurb
 *    of any query, require a WORD-BOUNDARY match rather than a raw substring,
 *    so a query can't match purely on the inside of a longer word.
 *  - Longer queries (> 4 chars) still allow substring matches in title/tags
 *    (so "machine" matches "Machine Learning") but the blurb stays
 *    word-boundary-only to keep noise down.
 */

export type SearchableCourse = {
  title: string;
  blurb: string;
  instructor: string;
  tags: string[];
};

const SHORT_QUERY_MAX = 4;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Whole-word (boundary) match: the needle appears as its own word. */
function wordMatch(haystack: string, needle: string): boolean {
  const re = new RegExp(`\\b${escapeRegExp(needle)}\\b`, "i");
  return re.test(haystack);
}

/**
 * Returns true if the course should appear for `query`.
 * Empty/whitespace query always matches (caller decides whether to run it).
 */
export function courseMatchesQuery(
  course: SearchableCourse,
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const title = course.title.toLowerCase();
  const instructor = course.instructor.toLowerCase();
  const tags = course.tags.map((t) => t.toLowerCase());
  const blurb = course.blurb.toLowerCase();

  const isShort = q.length <= SHORT_QUERY_MAX;

  // Title / tags / instructor: substring for longer queries, word-boundary for
  // short ones (so short queries don't match inside longer words like
  // "Pen[testing]").
  const fieldMatch = (field: string) =>
    isShort ? wordMatch(field, q) : field.includes(q);

  if (fieldMatch(title)) return true;
  if (fieldMatch(instructor)) return true;
  if (tags.some((t) => fieldMatch(t))) return true;

  // Blurb is the loosest field, so always require a word-boundary match there.
  if (wordMatch(blurb, q)) return true;

  return false;
}
