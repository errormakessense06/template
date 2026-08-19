/**
 * Section numbers are presentation derived from a section's position. They are
 * deliberately not stored in a title or accepted from an AI/import payload.
 */

const EXPLICIT_SECTION_PREFIX = /^\s*(?:section\s+\d+(?:\.\d+)*(?:(?:\s*[.)])|(?:\s*[:\-–—]))?|\d+(?:\.\d+)*\s*[.)]|\d+(?:\.\d+)*\s*[:\-–—]|\d+(?:\.\d+)+)\s+/i;
const BARE_SECTION_PREFIX = /^\s*\d+(?:\.\d+)*\s+/;

/**
 * Removes a leading section marker while leaving meaningful leading numbers
 * (for example, "2026 Project Budget") alone unless the caller has already
 * established that the input is a numbered outline.
 */
export function normalizeSectionHeading(value, { numberedOutline = false } = {}) {
  const heading = String(value ?? '').trim();
  if (!heading) return '';

  if (EXPLICIT_SECTION_PREFIX.test(heading)) {
    return heading.replace(EXPLICIT_SECTION_PREFIX, '').trim();
  }

  if (!numberedOutline) return heading;

  // A malformed AI/import heading can occasionally contain both a bare outline
  // marker and a conventional marker ("3 1. Overview"). Remove both, but only
  // after the caller has established this is a numbered outline.
  return heading
    .replace(BARE_SECTION_PREFIX, '')
    .replace(EXPLICIT_SECTION_PREFIX, '')
    .trim();
}

/**
 * Bare prefixes such as "2 Project Goals" are ambiguous on their own. They
 * are treated as section numbers only when two or more headings form a
 * sequential numbered outline.
 */
export function hasSequentialBareSectionPrefixes(headings) {
  const values = headings
    .map((heading) => String(heading ?? '').trim())
    .map((heading) => heading.match(/^\s*(\d+)\s+\S/))
    .filter(Boolean)
    .map((match) => Number(match[1]));

  return values.length >= 2 && values.every((value, index) => index === 0 || value === values[index - 1] + 1);
}

/** Canonicalizes persisted sections so order is the only source of numbering. */
export function normalizeDocumentSections(sections) {
  const safeSections = Array.isArray(sections) ? sections : [];
  const numberedOutline = hasSequentialBareSectionPrefixes(safeSections.map((section) => section.title));

  return safeSections.map(({ number: _legacyNumber, ...section }) => ({
    ...section,
    title: normalizeSectionHeading(section.title, { numberedOutline })
  }));
}
