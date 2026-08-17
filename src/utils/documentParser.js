const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

/**
 * Detects if the input text contains structured formatting such as
 * Markdown headings (#, ##), numbered titles, bullet points (*, -, •), or code blocks (```).
 */
export function isStructuredInput(text) {
  if (!text || typeof text !== 'string') return false;

  const trimmed = text.trim();
  if (!trimmed) return false;

  // Has Markdown headings (# Heading, ## Subheading)
  if (/^#{1,6}\s+\S+/m.test(trimmed)) return true;

  // Has code blocks (```)
  if (/```/.test(trimmed)) return true;

  // Has multiple bullet points (* item, - item, • item)
  const bulletMatches = trimmed.match(/^[*\-•]\s+\S+/gm);
  if (bulletMatches && bulletMatches.length >= 2) return true;

  // Has multiple numbered items/headings (1. Item, 2. Item)
  const numberedMatches = trimmed.match(/^\d+[\.\)]\s+\S+/gm);
  if (numberedMatches && numberedMatches.length >= 2) return true;

  return false;
}

/**
 * Parses structured markdown or outline text into document sections
 * with exact preservation of titles, numbering, hierarchy levels (1-6), lists, and code blocks.
 */
export function parseStructuredDocument(text) {
  if (!text || typeof text !== 'string') return [];

  const rawLines = text.replace(/\r\n/g, '\n').split('\n');
  const sections = [];

  let currentSection = null;
  let currentContentLines = [];
  let inCodeBlock = false;
  let codeBlockLines = [];

  const finalizeSection = () => {
    if (!currentSection) return;
    currentSection.content = processContentLines(currentContentLines);
    sections.push(currentSection);
    currentSection = null;
    currentContentLines = [];
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();

    // Fenced Code Block handling
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // Closing code block
        const codeText = codeBlockLines.join('\n');
        const codeHtml = `<pre class="bg-slate-900 text-slate-100 p-3.5 rounded-lg font-mono text-xs overflow-x-auto whitespace-pre font-normal my-2.5 shadow-inner"><code>${escapeHtml(codeText)}</code></pre>`;
        currentContentLines.push({ type: 'html', html: codeHtml });
        inCodeBlock = false;
        codeBlockLines = [];
      } else {
        // Opening code block
        inCodeBlock = true;
        codeBlockLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Markdown Heading Check (# Heading, ## Subheading, etc.)
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      finalizeSection();
      const level = headingMatch[1].length;
      const title = headingMatch[2].trim();
      currentSection = {
        id: `import-sec-${Date.now()}-${sections.length}`,
        number: '', // Set empty string so template defaultNum does not prepend extra numbers
        title: escapeHtml(title),
        level,
        isFixed: false,
        content: '',
        images: [],
        videos: [],
        urls: []
      };
      continue;
    }

    // Numbered Heading Line Check (e.g., "1. Project Overview", "4.1 System Architecture")
    // Only treat as section header if it's a standalone line (not inside a list block)
    const numHeadingMatch = line.match(/^(\d+(?:\.\d+)*[\.\)]?)\s+([A-Z0-9].*)$/);
    if (numHeadingMatch && !currentSection && isHeadingLine(trimmed, rawLines, i)) {
      finalizeSection();
      currentSection = {
        id: `import-sec-${Date.now()}-${sections.length}`,
        number: '',
        title: escapeHtml(trimmed),
        level: 1,
        isFixed: false,
        content: '',
        images: [],
        videos: [],
        urls: []
      };
      continue;
    }

    // If we don't have a current section yet, create an initial default section
    if (!currentSection) {
      currentSection = {
        id: `import-sec-${Date.now()}-${sections.length}`,
        number: '',
        title: 'Imported Document',
        level: 1,
        isFixed: false,
        content: '',
        images: [],
        videos: [],
        urls: []
      };
    }

    currentContentLines.push({ type: 'text', text: line });
  }

  finalizeSection();
  return sections;
}

/**
 * Helper to determine if a numbered line is a section heading vs a list item inside a section.
 */
function isHeadingLine(trimmed, lines, index) {
  if (trimmed.length > 80) return false;
  // If previous line was empty or non-existent and line is short, it's likely a heading
  const prevLine = index > 0 ? lines[index - 1].trim() : '';
  const nextLine = index < lines.length - 1 ? lines[index + 1].trim() : '';
  return prevLine === '' || nextLine !== '';
}

/**
 * Converts raw content lines into formatted HTML (<p>, <ul>, <ol>, <pre>).
 */
function processContentLines(contentEntries) {
  let html = '';
  let inList = false;
  let listType = 'ul';

  const closeListIfNeeded = () => {
    if (inList) {
      html += `</${listType}>`;
      inList = false;
    }
  };

  for (let entry of contentEntries) {
    if (entry.type === 'html') {
      closeListIfNeeded();
      html += entry.html;
      continue;
    }

    const line = entry.text;
    const trimmed = line.trim();

    if (!trimmed) {
      closeListIfNeeded();
      continue;
    }

    // Bullet List Item (* item, - item, • item)
    const bulletMatch = line.match(/^\s*([*\-•])\s+(.+)$/);
    if (bulletMatch) {
      if (!inList || listType !== 'ul') {
        closeListIfNeeded();
        html += '<ul class="list-disc pl-5 my-2 space-y-1">';
        inList = true;
        listType = 'ul';
      }
      html += `<li>${escapeHtml(bulletMatch[2])}</li>`;
      continue;
    }

    // Numbered List Item (1. item, 2. item)
    const numMatch = line.match(/^\s*(\d+)[\.\)]\s+(.+)$/);
    if (numMatch) {
      if (!inList || listType !== 'ol') {
        closeListIfNeeded();
        html += '<ol class="list-decimal pl-5 my-2 space-y-1">';
        inList = true;
        listType = 'ol';
      }
      html += `<li>${escapeHtml(numMatch[2])}</li>`;
      continue;
    }

    // Regular Paragraph
    closeListIfNeeded();
    html += `<p class="my-1.5">${escapeHtml(trimmed)}</p>`;
  }

  closeListIfNeeded();
  return html;
}
