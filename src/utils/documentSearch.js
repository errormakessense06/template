const decodeHtml = (value) => {
  const html = String(value ?? '');
  if (typeof document !== 'undefined') {
    const element = document.createElement('textarea');
    element.innerHTML = html;
    return element.value;
  }
  return html.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#039;/g, "'").replace(/&quot;/g, '"');
};

/** Converts stored rich text to visible text without changing the stored HTML. */
export const htmlToSearchText = (value) => decodeHtml(String(value ?? '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim());

const sectionSearchText = (section) => [
  section.title,
  section.content,
  ...(section.table?.headers || []),
  ...((section.table?.rows || []).flat()),
  ...(section.images || []).map((image) => image.caption),
  ...(section.videos || []).map((video) => video.caption),
  ...(section.urls || []).flatMap((url) => [url.title, url.link])
].map(htmlToSearchText).filter(Boolean).join(' ');

const excerptForMatch = (text, start, length) => {
  const radius = 58;
  const from = Math.max(0, start - radius);
  const to = Math.min(text.length, start + length + radius);
  return `${from > 0 ? '…' : ''}${text.slice(from, to)}${to < text.length ? '…' : ''}`;
};

/** Returns read-only search metadata. It never writes section state or HTML. */
export function findDocumentMatches(sections, query) {
  const term = String(query ?? '').trim().replace(/\s+/g, ' ');
  if (!term) return [];

  const needle = term.toLocaleLowerCase();
  const matches = [];

  (sections || []).forEach((section, sectionIndex) => {
    const text = sectionSearchText(section);
    const haystack = text.toLocaleLowerCase();
    let fromIndex = 0;
    let occurrence = 0;
    let matchIndex = haystack.indexOf(needle, fromIndex);

    while (matchIndex !== -1) {
      matches.push({
        id: `${section.id}:${occurrence}`,
        sectionId: section.id,
        sectionNumber: sectionIndex + 1,
        sectionTitle: htmlToSearchText(section.title) || 'Untitled section',
        occurrence,
        query: term,
        excerpt: excerptForMatch(text, matchIndex, term.length)
      });
      occurrence += 1;
      fromIndex = matchIndex + needle.length;
      matchIndex = haystack.indexOf(needle, fromIndex);
    }
  });

  return matches;
}
