import React, { useState, useEffect } from 'react';
import Toolbar from './components/Toolbar';
import CoverPage from './components/CoverPage';
import DocumentEditor from './components/DocumentEditor';
import { DEFAULT_TEMPLATE } from './data/defaultTemplate';

const BACKEND_URL = 'http://localhost:5001';
const LOCAL_STORAGE_KEY = 'tekquora_doc_studio_templates_v12';
const ACTIVE_TEMPLATE_KEY = 'tekquora_doc_studio_active_id_v12';
const LAYOUT_MODE_KEY = 'tekquora_doc_studio_layout_mode_v12';
const AUTO_SAVE_KEY = 'tekquora_doc_studio_auto_save_v12';

export default function App() {
  const [isSaved, setIsSaved] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);

  // Custom Ribbon States
  const [fontSize, setFontSize] = useState('16px');
  const [fontFamily, setFontFamily] = useState('Georgia');
  const [textAlign, setTextAlign] = useState('left');

  // Layout Mode State ('a4' vs 'landscape')
  const [layoutMode, setLayoutMode] = useState(() => {
    return localStorage.getItem(LAYOUT_MODE_KEY) || 'a4';
  });

  const handleLayoutModeChange = (mode) => {
    setLayoutMode(mode);
    try {
      localStorage.setItem(LAYOUT_MODE_KEY, mode);
    } catch (e) {
      console.warn('Could not save layoutMode to localStorage:', e);
    }
  };

  // Auto-save Toggle State (default: true)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(() => {
    const saved = localStorage.getItem(AUTO_SAVE_KEY);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const handleToggleAutoSave = () => {
    setAutoSaveEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('LocalStorage error saving autoSave preference:', e);
      }
      return next;
    });
  };

  // Track Active Focused Section ID
  const [activeSectionId, setActiveSectionId] = useState(null);

  // Initialize templates from LocalStorage or DEFAULT_TEMPLATE
  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const defaultDoc = parsed.find(t => t.id === DEFAULT_TEMPLATE.id);
          if (!defaultDoc || !defaultDoc.sections || defaultDoc.sections.length < DEFAULT_TEMPLATE.sections.length) {
            console.log('[App] Upgrading cached template to all 38 default sections');
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([DEFAULT_TEMPLATE]));
            return [DEFAULT_TEMPLATE];
          }
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved templates:', e);
      }
    }
    return [DEFAULT_TEMPLATE];
  });

  const [activeTemplateId, setActiveTemplateId] = useState(() => {
    return localStorage.getItem(ACTIVE_TEMPLATE_KEY) || DEFAULT_TEMPLATE.id;
  });

  const activeTemplate = templates.find((t) => t.id === activeTemplateId) || templates[0] || DEFAULT_TEMPLATE;

  // Track latest state in Refs to prevent stale closure race conditions during save
  const templatesRef = React.useRef(templates);
  const activeTemplateIdRef = React.useRef(activeTemplateId);

  React.useEffect(() => {
    templatesRef.current = templates;
  }, [templates]);

  React.useEffect(() => {
    activeTemplateIdRef.current = activeTemplateId;
  }, [activeTemplateId]);

  // Check Backend Connection Health
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/health`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.status === 'online') {
          setBackendConnected(true);
        }
      })
      .catch(() => setBackendConnected(false));
  }, []);

  // Safe Auto-save to LocalStorage & Backend API (Controlled by autoSaveEnabled)
  useEffect(() => {
    if (!autoSaveEnabled) {
      setIsSaved(true);
      return;
    }

    setIsSaved(false);

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(templates));
      localStorage.setItem(ACTIVE_TEMPLATE_KEY, activeTemplateId);
    } catch (err) {
      console.warn('LocalStorage quota limit absorbed safely.', err);
    }

    if (activeTemplate) {
      fetch(`${BACKEND_URL}/api/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activeTemplate)
      })
        .then(() => setBackendConnected(true))
        .catch(() => setBackendConnected(false));
    }

    const timer = setTimeout(() => setIsSaved(true), 300);
    return () => clearTimeout(timer);
  }, [templates, activeTemplateId, autoSaveEnabled]);

  // Insert Uploaded Image File
  const handleInsertImageFile = (imageUrl, fileName) => {
    setTemplates((prevTemplates) =>
      prevTemplates.map((tpl) => {
        if (tpl.id !== activeTemplate.id) return tpl;
        const targetId = activeSectionId || (tpl.sections[0] && tpl.sections[0].id);
        return {
          ...tpl,
          sections: tpl.sections.map((sec) =>
            sec.id === targetId ? {
              ...sec,
              images: [...(sec.images || []), { id: 'img-' + Date.now(), url: imageUrl, caption: fileName || 'Uploaded Image' }]
            } : sec
          )
        };
      })
    );
  };

  // Insert Uploaded Video File
  const handleInsertVideoFile = (videoUrl, fileName) => {
    setTemplates((prevTemplates) =>
      prevTemplates.map((tpl) => {
        if (tpl.id !== activeTemplate.id) return tpl;
        const targetId = activeSectionId || (tpl.sections[0] && tpl.sections[0].id);
        return {
          ...tpl,
          sections: tpl.sections.map((sec) =>
            sec.id === targetId ? {
              ...sec,
              videos: [...(sec.videos || []), { id: 'vid-' + Date.now(), url: videoUrl, caption: fileName || 'Uploaded Video' }]
            } : sec
          )
        };
      })
    );
  };

  const handleApplyFormatToActive = (formatType) => {
    if (!activeTemplate || !activeTemplate.sections.length) return;
    let addedTag = '';

    switch (formatType) {
      case 'bold': addedTag = ' **bold text**'; break;
      case 'italic': addedTag = ' *italic text*'; break;
      case 'underline': addedTag = ' <u>underlined text</u>'; break;
      case 'strikethrough': addedTag = ' ~~strikethrough text~~'; break;
      case 'bullet': addedTag = '\n• New bullet point'; break;
      case 'numbered': addedTag = '\n1. New numbered list item'; break;
      case 'quote': addedTag = '\n> "This is a highlighted quote paragraph."'; break;
      case 'divider': addedTag = '\n\n---\n\n'; break;
      case 'emoji': addedTag = ' 😊✨📌'; break;
      case 'magic': addedTag = '\n\n✨ [AI Enhanced Clause]: Verified for enterprise compliance.'; break;
      default: break;
    }

    setTemplates((prevTemplates) =>
      prevTemplates.map((tpl) => {
        if (tpl.id !== activeTemplate.id) return tpl;
        const targetId = activeSectionId || (tpl.sections[0] && tpl.sections[0].id);
        return {
          ...tpl,
          sections: tpl.sections.map((sec) =>
            sec.id === targetId ? { ...sec, content: (sec.content || '') + addedTag } : sec
          )
        };
      })
    );
  };

  const handleInsertTableToActive = () => {
    setTemplates((prevTemplates) =>
      prevTemplates.map((tpl) => {
        if (tpl.id !== activeTemplate.id) return tpl;
        const targetId = activeSectionId || (tpl.sections[0] && tpl.sections[0].id);
        return {
          ...tpl,
          sections: tpl.sections.map((sec) =>
            sec.id === targetId ? {
              ...sec,
              table: {
                headers: ['Module / Item', 'Details', 'Status'],
                rows: [
                  ['Project Scope', 'Full Content Paragraphs Requirements', 'Completed'],
                  ['System Integration', 'API & Database Sync', 'In Progress']
                ]
              }
            } : sec
          )
        };
      })
    );
  };

  const handleInsertUrlToActive = () => {
    const link = window.prompt('Enter Hyperlink Bookmark:', 'https://tekquora.com');
    if (link) {
      setTemplates((prevTemplates) =>
        prevTemplates.map((tpl) => {
          if (tpl.id !== activeTemplate.id) return tpl;
          const targetId = activeSectionId || (tpl.sections[0] && tpl.sections[0].id);
          return {
            ...tpl,
            sections: tpl.sections.map((sec) =>
              sec.id === targetId ? {
                ...sec,
                urls: [...(sec.urls || []), { id: 'url-' + Date.now(), title: link, link }]
              } : sec
            )
          };
        })
      );
    }
  };

  const handleAiGenerate = (promptText) => {
    if (!promptText || !promptText.trim()) return;

    const lowerPrompt = promptText.toLowerCase();
    let topicDetail = "TekQuora's custom digital platform establishes a robust, enterprise-grade architecture designed to streamline operational workflows, optimize data management, and accelerate digital transformation for high-scale enterprise applications.";
    
    if (lowerPrompt.includes('database') || lowerPrompt.includes('migration') || lowerPrompt.includes('cloud')) {
      topicDetail = "The cloud database migration initiative guarantees high availability, zero-downtime database replication, automated encrypted backups, and optimized query performance across scalable cloud infrastructure.";
    } else if (lowerPrompt.includes('scope') || lowerPrompt.includes('summary') || lowerPrompt.includes('project')) {
      topicDetail = "The project scope encompasses complete end-to-end design, modular software development, rigorous quality assurance, continuous integration deployment, and comprehensive post-launch technical support.";
    } else if (lowerPrompt.includes('security') || lowerPrompt.includes('auth')) {
      topicDetail = "The security framework incorporates multi-factor authentication, end-to-end data encryption (AES-256), granular role-based access controls (RBAC), and automated compliance auditing.";
    }

    const aiHtmlBlock = `<p><strong>✨ AI Generated Content (${promptText}):</strong><br/>${topicDetail}</p>`;

    let updatedTargetNumber = '1';

    setTemplates((prevTemplates) =>
      prevTemplates.map((tpl) => {
        if (tpl.id !== activeTemplate.id) return tpl;
        
        const targetId = activeSectionId || (tpl.sections[0] && tpl.sections[0].id);
        const targetSec = tpl.sections.find(s => s.id === targetId) || tpl.sections[0];
        if (targetSec) updatedTargetNumber = targetSec.number || '1';

        return {
          ...tpl,
          sections: tpl.sections.map((sec) => {
            if (sec.id !== targetId) return sec;
            const existingContent = sec.content || '';
            const newContent = existingContent ? `${existingContent}\n${aiHtmlBlock}` : aiHtmlBlock;
            return { ...sec, content: newContent };
          })
        };
      })
    );

    setSaveNotification({
      type: 'success',
      message: `✨ AI Paragraph generated and added to Section ${updatedTargetNumber}!`
    });
    setTimeout(() => setSaveNotification(null), 4000);
  };

  const handleSelectTemplate = (id) => setActiveTemplateId(id);

  const handleUpdateSection = (sectionId, updatedData) => {
    setTemplates((prevTemplates) =>
      prevTemplates.map((tpl) => {
        if (tpl.id !== activeTemplate.id) return tpl;
        return {
          ...tpl,
          sections: tpl.sections.map((sec) =>
            sec.id === sectionId ? { ...sec, ...updatedData } : sec
          )
        };
      })
    );
  };

  const handleUpdateBranding = (newBranding) => {
    setTemplates((prevTemplates) =>
      prevTemplates.map((tpl) => {
        if (tpl.id !== activeTemplate.id) return tpl;
        return {
          ...tpl,
          branding: newBranding
        };
      })
    );
  };

  const handleAddSection = () => {
    const newSec = {
      id: 'sec-' + Date.now(),
      number: String(activeTemplate.sections.length + 1),
      title: 'New Requirement Heading',
      isFixed: false,
      content: '',
      images: [],
      videos: [],
      urls: []
    };

    setTemplates((prevTemplates) =>
      prevTemplates.map((tpl) => {
        if (tpl.id !== activeTemplate.id) return tpl;
        return {
          ...tpl,
          sections: [...tpl.sections, newSec]
        };
      })
    );
  };

  const handleInsertSectionAfter = (index) => {
    const newSec = {
      id: 'sec-' + Date.now(),
      number: String(index + 2),
      title: 'New Requirement Heading',
      isFixed: false,
      content: '',
      images: [],
      videos: [],
      urls: []
    };

    setTemplates((prevTemplates) =>
      prevTemplates.map((tpl) => {
        if (tpl.id !== activeTemplate.id) return tpl;
        const updated = [...tpl.sections];
        updated.splice(index + 1, 0, newSec);
        const renumbered = updated.map((s, idx) => ({ ...s, number: String(idx + 1) }));
        return {
          ...tpl,
          sections: renumbered
        };
      })
    );
  };

  const handleRemoveSection = (sectionId) => {
    setTemplates((prevTemplates) =>
      prevTemplates.map((tpl) => {
        if (tpl.id !== activeTemplate.id) return tpl;
        const filtered = tpl.sections.filter((s) => s.id !== sectionId);
        const renumbered = filtered.map((s, idx) => ({ ...s, number: String(idx + 1) }));
        return {
          ...tpl,
          sections: renumbered
        };
      })
    );
  };

  const handleReorderSection = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= activeTemplate.sections.length) return;

    setTemplates((prevTemplates) =>
      prevTemplates.map((tpl) => {
        if (tpl.id !== activeTemplate.id) return tpl;
        const updated = [...tpl.sections];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);

        const renumbered = updated.map((s, idx) => ({ ...s, number: String(idx + 1) }));
        return {
          ...tpl,
          sections: renumbered
        };
      })
    );
  };

  const handleClearAllContent = () => {
    if (window.confirm('Clear all paragraph content under headings?')) {
      setTemplates((prevTemplates) =>
        prevTemplates.map((tpl) => {
          if (tpl.id !== activeTemplate.id) return tpl;
          return {
            ...tpl,
            sections: tpl.sections.map((s) => ({
              ...s,
              content: '',
              images: [],
              videos: [],
              urls: [],
              table: null
            }))
          };
        })
      );
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset document to default TekQuora PDF proposal template?')) {
      setTemplates([DEFAULT_TEMPLATE]);
      setActiveTemplateId(DEFAULT_TEMPLATE.id);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem(ACTIVE_TEMPLATE_KEY);
    }
  };

  const [isSaving, setIsSaving] = useState(false);
  const [saveNotification, setSaveNotification] = useState(null);

  // Explicit Save Document Workflow (Race-Condition Free LocalStorage + Backend API)
  const handleSaveDocument = async () => {
    console.log('[Save Workflow] 1. Save triggered');
    setIsSaving(true);

    try {
      // 1. Force blur any active contentEditable element so pending input/blur events fire
      if (document.activeElement && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      // 2. Short pause for pending React state updates to flush into refs
      await new Promise((resolve) => setTimeout(resolve, 150));

      const currentTemplates = templatesRef.current;
      const currentActiveId = activeTemplateIdRef.current || activeTemplateId;
      const currentActiveDoc = currentTemplates.find((t) => t.id === currentActiveId) || currentTemplates[0];

      if (!currentActiveDoc) {
        throw new Error('No active document template found to save.');
      }

      console.log('[Save Workflow] 2. Saving latest data:', {
        id: currentActiveDoc.id,
        title: currentActiveDoc.branding?.title || currentActiveDoc.name,
        sectionCount: currentActiveDoc.sections?.length || 0
      });

      // 3. LocalStorage Persistence
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentTemplates));
      localStorage.setItem(ACTIVE_TEMPLATE_KEY, currentActiveId);
      console.log('[Save Workflow] 3. LocalStorage save successful');

      // 4. Backend API Save with timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(`${BACKEND_URL}/api/documents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentActiveDoc),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          setBackendConnected(true);
          console.log('[Save Workflow] 4. Backend API save successful');
        } else {
          console.warn('[Save Workflow] Backend API returned status:', response.status);
        }
      } catch (apiErr) {
        console.warn('[Save Workflow] Backend API offline or unreachable, saved locally:', apiErr.message);
        setBackendConnected(false);
      }

      setIsSaved(true);
      console.log('[Save Workflow] 5. Save completed successfully');

      // 5. Trigger PDF export — run independently so a PDF failure never
      //    surfaces as a save failure (save already succeeded above).
      const cleanTitle = (currentActiveDoc.branding?.title || currentActiveDoc.name || 'TekQuora_Document').replace(/[^a-zA-Z0-9_\-]/g, '_');
      try {
        await exportDocumentPdf(`${cleanTitle}.pdf`);
        setSaveNotification({ type: 'success', message: 'Document saved and exported as PDF successfully!' });
      } catch (pdfErr) {
        console.warn('[Save Workflow] PDF export failed (document was saved):', pdfErr.message);
        setSaveNotification({ type: 'success', message: 'Document saved. PDF export failed — check console.' });
      }
      setTimeout(() => setSaveNotification(null), 3500);
    } catch (err) {
      console.error('[Save Workflow] Save failed:', err);
      setSaveNotification({ type: 'error', message: `Save failed: ${err.message}` });
      setTimeout(() => setSaveNotification(null), 4000);
    } finally {
      setIsSaving(false);
      console.log('[Save Workflow] 6. Loading state reset (isSaving = false)');
    }
  };

  // Per-Section Text Alignment Handler
  const handleSetTextAlign = (newAlign) => {
    if (!activeTemplate || !activeTemplate.sections.length) return;
    const targetId = activeSectionId || (activeTemplate.sections[0] && activeTemplate.sections[0].id);
    if (targetId) {
      handleUpdateSection(targetId, { textAlign: newAlign });
    }
  };

  const activeSection = activeTemplate.sections.find((s) => s.id === activeSectionId) || activeTemplate.sections[0];
  const activeTextAlign = (activeSection && activeSection.textAlign) ? activeSection.textAlign : 'left';

  // Builds a self-contained HTML string Puppeteer can render as a print page
  const buildPrintableHtml = (sourceEl) => {
    const styleTags = Array.from(document.querySelectorAll('style'))
      .map((s) => s.outerHTML)
      .join('\n');
    const linkTags = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .map((l) => l.outerHTML)
      .join('\n');
    const baseTag = `<base href="${window.location.origin}/">`;

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
${baseTag}
${linkTags}
${styleTags}
</head>
<body class="is-exporting">
${sourceEl.outerHTML}
</body>
</html>`;
  };

  // High-Fidelity PDF & Microsoft Word Export Handlers
  const exportDocumentPdf = async (filename = 'TekQuora_Document.pdf') => {
    document.body.classList.add('is-exporting');
    const exportContainer = document.getElementById('document-export-container');
    if (exportContainer) exportContainer.classList.add('is-exporting');

    try {
      const sourceEl = document.getElementById('document-export-container');
      if (!sourceEl) return;

      await new Promise((r) => setTimeout(r, 150));

      const fullHtml = buildPrintableHtml(sourceEl);

      // Use a 60-second timeout — Puppeteer needs time to launch Chromium,
      // render the page, and generate the PDF before responding.
      const pdfAbort = new AbortController();
      const pdfTimeout = setTimeout(() => pdfAbort.abort(), 60000);

      let response;
      try {
        response = await fetch('http://localhost:5001/api/export-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ html: fullHtml, filename }),
          signal: pdfAbort.signal
        });
      } finally {
        clearTimeout(pdfTimeout);
      }

      if (!response.ok) {
        throw new Error(`PDF export failed: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      document.body.classList.remove('is-exporting');
      if (exportContainer) exportContainer.classList.remove('is-exporting');
    }
  };

  const exportDocumentWord = async (filename = 'TekQuora_Document.doc') => {
    document.body.classList.add('is-exporting');
    const exportContainer = document.getElementById('document-export-container');
    if (exportContainer) exportContainer.classList.add('is-exporting');

    try {
      const sourceEl = document.getElementById('document-export-container');
      if (!sourceEl) return;

      // Small settle tick so DOM is fully flushed before we read layout
      await new Promise((r) => setTimeout(r, 50));

      const clone = sourceEl.cloneNode(true);
      const elementsToRemove = clone.querySelectorAll('button, .no-print, .export-hide');
      elementsToRemove.forEach((el) => el.remove());

      // Inject explicit width/height attributes on every <img> in the cloned
      // DOM, computed from the live rendered bounding rect, so Word's HTML
      // renderer uses the correct display dimensions instead of native pixels.
      const liveImages = Array.from(sourceEl.querySelectorAll('img'));
      const cloneImages = Array.from(clone.querySelectorAll('img'));
      liveImages.forEach((liveImg, idx) => {
        const cloneImg = cloneImages[idx];
        if (!cloneImg) return;
        const rect = liveImg.getBoundingClientRect();
        if (rect.width > 0) {
          cloneImg.setAttribute('width', Math.round(rect.width));
          cloneImg.setAttribute('height', Math.round(rect.height));
        }
      });

      // Fuller Word-compatible style block mirroring src/index.css rules.
      // All flexbox/grid removed — Word's HTML renderer does not support them.
      const wordStyle =
        'body {' +
          'font-family: Georgia, serif;' +
          'margin: 20px 30px;' +
          'color: #1e293b;' +
          'font-size: 11pt;' +
          'line-height: 1.4;' +
          'mso-pagination: widow-orphan;' +
        '}' +

        /* doc-page */
        '.doc-page {' +
          'width: 100%;' +
          'padding: 30px 45px;' +
          'background: #ffffff;' +
          'box-sizing: border-box;' +
        '}' +

        /* Headings — doc-heading-main */
        'h1, h2, h3, .doc-heading-main, .editable-heading, .doc-heading-number {' +
          'font-family: Georgia, serif;' +
          'font-size: 14pt;' +
          'font-weight: 700;' +
          'color: #000000;' +
          'margin-top: 0.75rem;' +
          'margin-bottom: 0.25rem;' +
          'line-height: 1.25;' +
          'display: block;' +
          'page-break-after: avoid;' +
          'mso-pagination: widow-orphan lines-together;' +
        '}' +

        /* doc-body-text */
        '.doc-body-text {' +
          'font-family: Georgia, serif;' +
          'font-size: 10.5pt;' +
          'line-height: 1.45;' +
          'color: #1e293b;' +
        '}' +
        '.doc-body-text p, .rendered-doc-content p {' +
          'margin-top: 0;' +
          'margin-bottom: 0.4rem;' +
          'line-height: 1.45;' +
          'text-align: left;' +
          'mso-pagination: widow-orphan;' +
        '}' +
        '.doc-body-text ul, .rendered-doc-content ul, ul {' +
          'list-style-type: disc !important;' +
          'list-style-position: outside !important;' +
          'padding-left: 1.5rem !important;' +
          'margin-top: 0.2rem !important;' +
          'margin-bottom: 0.4rem !important;' +
        '}' +
        '.doc-body-text ol, .rendered-doc-content ol, ol {' +
          'list-style-type: decimal !important;' +
          'list-style-position: outside !important;' +
          'padding-left: 1.5rem !important;' +
          'margin-top: 0.2rem !important;' +
          'margin-bottom: 0.4rem !important;' +
        '}' +
        '.doc-body-text li, .rendered-doc-content li, li {' +
          'display: list-item !important;' +
          'list-style-type: inherit !important;' +
          'margin-bottom: 0.15rem !important;' +
          'line-height: 1.45 !important;' +
        '}' +
        '.doc-body-text a, .rendered-doc-content a {' +
          'color: #2563eb;' +
          'text-decoration: underline;' +
        '}' +

        /* doc-table */
        '.doc-table {' +
          'width: 100%;' +
          'border-collapse: collapse;' +
          'margin: 0.5rem 0;' +
          'font-size: 9.5pt;' +
          'page-break-inside: avoid;' +
        '}' +
        '.doc-table th {' +
          'background-color: #f8fafc;' +
          'color: #0f172a;' +
          'font-weight: 700;' +
          'text-align: left;' +
          'padding: 6px 10px;' +
          'border: 1px solid #cbd5e1;' +
        '}' +
        '.doc-table td {' +
          'padding: 6px 10px;' +
          'border: 1px solid #cbd5e1;' +
          'color: #334155;' +
          'vertical-align: top;' +
        '}' +
        '.doc-table tr:nth-child(even) {' +
          'background-color: #fdfdfd;' +
        '}' +

        /* Page-break controls */
        'tr { page-break-inside: avoid; }' +
        'img, table { page-break-inside: avoid; }' +
        'h1, h2, h3 { page-break-after: avoid; }' +

        /* Images */
        'img {' +
          'max-width: 100%;' +
          'height: auto;' +
          'display: block;' +
          'margin: 8px 0;' +
        '}';

      const header =
        "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
        "xmlns:w='urn:schemas-microsoft-com:office:word' " +
        "xmlns='http://www.w3.org/TR/REC-html40'>" +
        "<head><meta charset='utf-8'><title>Document</title>" +
        "<style>" + wordStyle + "</style>" +
        "</head><body>";
      const footer = "</body></html>";
      const html = header + clone.innerHTML + footer;

      const blob = new Blob(['\ufeff' + html], {
        type: 'application/msword'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      document.body.classList.remove('is-exporting');
      if (exportContainer) exportContainer.classList.remove('is-exporting');
    }
  };

  const handlePrint = () => {
    const cleanTitle = (activeTemplate?.branding?.title || activeTemplate?.name || 'TekQuora_Document').replace(/[^a-zA-Z0-9_\-]/g, '_');
    exportDocumentPdf(`${cleanTitle}.pdf`);
  };

  const handleExportWord = () => {
    const cleanTitle = (activeTemplate?.branding?.title || activeTemplate?.name || 'TekQuora_Document').replace(/[^a-zA-Z0-9_\-]/g, '_');
    exportDocumentWord(`${cleanTitle}.doc`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 relative">
      
      {saveNotification && (
        <div className={`no-print fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 border transition-all ${
          saveNotification.type === 'success' 
            ? 'bg-emerald-900 text-emerald-100 border-emerald-700' 
            : 'bg-rose-900 text-rose-100 border-rose-700'
        }`}>
          <span>{saveNotification.message}</span>
        </div>
      )}

      <Toolbar
        activeTemplate={activeTemplate}
        templates={templates}
        onSelectTemplate={handleSelectTemplate}
        onAddSection={handleAddSection}
        onPrint={handlePrint}
        onExportWord={handleExportWord}
        onSaveDocument={handleSaveDocument}
        isSaving={isSaving}
        onReset={handleReset}
        onClearAllContent={handleClearAllContent}
        isSaved={isSaved}
        backendConnected={backendConnected}
        onApplyFormatToActive={handleApplyFormatToActive}
        onInsertImageFile={handleInsertImageFile}
        onInsertVideoFile={handleInsertVideoFile}
        onInsertTableToActive={handleInsertTableToActive}
        onInsertUrlToActive={handleInsertUrlToActive}
        fontSize={fontSize}
        setFontSize={setFontSize}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        textAlign={activeTextAlign}
        setTextAlign={handleSetTextAlign}
        onAiGenerate={handleAiGenerate}
        layoutMode={layoutMode}
        onLayoutModeChange={handleLayoutModeChange}
        autoSaveEnabled={autoSaveEnabled}
        onToggleAutoSave={handleToggleAutoSave}
      />

      <main className="doc-canvas flex-1 p-3 sm:p-6 overflow-y-auto overflow-x-auto flex justify-center">
        <div 
          id="document-export-container"
          className={`w-full transition-all duration-300 ease-in-out space-y-5 ${
            layoutMode === 'a4'
              ? 'max-w-[794px] mx-auto'
              : 'max-w-[1320px] mx-auto px-2 sm:px-4'
          }`}
        >
          
          <CoverPage
            branding={activeTemplate.branding}
            onUpdateBranding={handleUpdateBranding}
            fontFamily={fontFamily}
            layoutMode={layoutMode}
          />

          <DocumentEditor
            sections={activeTemplate.sections}
            onUpdateSection={handleUpdateSection}
            onRemoveSection={handleRemoveSection}
            onReorderSection={handleReorderSection}
            onInsertSectionAfter={handleInsertSectionAfter}
            onSectionFocus={(secId) => setActiveSectionId(secId)}
            fontSize={fontSize}
            fontFamily={fontFamily}
            layoutMode={layoutMode}
          />

        </div>
      </main>

    </div>
  );
}
