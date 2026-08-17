import React, { useRef, useEffect } from 'react';
import { 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Plus, 
  ExternalLink,
  Image as ImageIcon,
  Video as VideoIcon,
  Link as LinkIcon,
  Crop,
  Maximize2,
  Minimize2
} from 'lucide-react';
import ImageCropModal from './ImageCropModal';

const BACKEND_URL = 'http://localhost:5001';

// Stable ContentEditable Wrapper that preserves active selection range
function EditableContent({ html, onChange, className, style, placeholder, ...props }) {
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current && document.activeElement !== contentRef.current) {
      if (contentRef.current.innerHTML !== html) {
        contentRef.current.innerHTML = html || '';
      }
    }
  }, [html]);

  const handleInput = () => {
    if (contentRef.current && onChange) {
      onChange(contentRef.current.innerHTML);
    }
  };

  return (
    <div
      ref={contentRef}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onBlur={handleInput}
      className={className}
      style={style}
      {...props}
    />
  );
}

export default function DocumentEditor({
  sections,
  onUpdateSection,
  onRemoveSection,
  onReorderSection,
  onInsertSectionAfter,
  onSectionFocus,
  fontSize = '16px',
  fontFamily = 'Georgia',
  textAlign = 'left',
  layoutMode = 'a4'
}) {
  const [showUrlModalSectionId, setShowUrlModalSectionId] = React.useState(null);
  const [urlLink, setUrlLink] = React.useState('');
  const [urlTitle, setUrlTitle] = React.useState('');
  const [cropTarget, setCropTarget] = React.useState(null);

  // Local Media Upload Handlers
  const handleLocalImageUpload = async (e, sectionId) => {
    const file = e.target.files[0];
    if (!file) return;

    let imageUrl = '';
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${BACKEND_URL}/api/upload`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.file && data.file.url) {
          imageUrl = data.file.url;
        }
      }
    } catch (err) {
      console.warn('Backend API upload fallback to object URL:', err);
    }

    if (!imageUrl) {
      try {
        imageUrl = URL.createObjectURL(file);
      } catch (err) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const targetSec = sections.find(s => s.id === sectionId);
          if (targetSec) {
            onUpdateSection(sectionId, {
              images: [...(targetSec.images || []), { id: 'img-' + Date.now(), url: ev.target.result, caption: file.name }]
            });
          }
        };
        reader.readAsDataURL(file);
        e.target.value = '';
        return;
      }
    }

    const targetSec = sections.find(s => s.id === sectionId);
    if (targetSec) {
      onUpdateSection(sectionId, {
        images: [...(targetSec.images || []), { id: 'img-' + Date.now(), url: imageUrl, caption: file.name }]
      });
    }
    e.target.value = '';
  };

  const handleLocalVideoUpload = async (e, sectionId) => {
    const file = e.target.files[0];
    if (!file) return;

    let videoUrl = '';
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${BACKEND_URL}/api/upload`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.file && data.file.url) {
          videoUrl = data.file.url;
        }
      }
    } catch (err) {
      console.warn('Backend API upload fallback to object URL:', err);
    }

    if (!videoUrl) {
      try {
        videoUrl = URL.createObjectURL(file);
      } catch (err) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const targetSec = sections.find(s => s.id === sectionId);
          if (targetSec) {
            onUpdateSection(sectionId, {
              videos: [...(targetSec.videos || []), { id: 'vid-' + Date.now(), url: ev.target.result, caption: file.name }]
            });
          }
        };
        reader.readAsDataURL(file);
        e.target.value = '';
        return;
      }
    }

    const targetSec = sections.find(s => s.id === sectionId);
    if (targetSec) {
      onUpdateSection(sectionId, {
        videos: [...(targetSec.videos || []), { id: 'vid-' + Date.now(), url: videoUrl, caption: file.name }]
      });
    }
    e.target.value = '';
  };

  // Table Editing
  const handleAddTableRow = (sectionId) => {
    const targetSec = sections.find(s => s.id === sectionId);
    if (!targetSec || !targetSec.table) return;

    const colCount = targetSec.table.headers.length;
    const newRow = Array(colCount).fill('');

    onUpdateSection(sectionId, {
      table: {
        ...targetSec.table,
        rows: [...targetSec.table.rows, newRow]
      }
    });
  };

  const handleAddTableCol = (sectionId) => {
    const targetSec = sections.find(s => s.id === sectionId);
    if (!targetSec || !targetSec.table) return;

    const updatedHeaders = [...targetSec.table.headers, 'New Column'];
    const updatedRows = targetSec.table.rows.map(row => [...row, '']);

    onUpdateSection(sectionId, {
      table: {
        headers: updatedHeaders,
        rows: updatedRows
      }
    });
  };

  const handleDeleteTableRow = (sectionId, rowIndex) => {
    const targetSec = sections.find(s => s.id === sectionId);
    if (!targetSec || !targetSec.table) return;

    const updatedRows = targetSec.table.rows.filter((_, idx) => idx !== rowIndex);
    onUpdateSection(sectionId, {
      table: {
        ...targetSec.table,
        rows: updatedRows
      }
    });
  };

  const handleDeleteTableCol = (sectionId, colIndex) => {
    const targetSec = sections.find(s => s.id === sectionId);
    if (!targetSec || !targetSec.table) return;

    const updatedHeaders = targetSec.table.headers.filter((_, idx) => idx !== colIndex);
    const updatedRows = targetSec.table.rows.map(row => row.filter((_, idx) => idx !== colIndex));

    if (updatedHeaders.length === 0) {
      onUpdateSection(sectionId, { table: null });
    } else {
      onUpdateSection(sectionId, {
        table: {
          headers: updatedHeaders,
          rows: updatedRows
        }
      });
    }
  };

  const handleRemoveTable = (sectionId) => {
    onUpdateSection(sectionId, { table: null });
  };

  const handleTableCellEdit = (sectionId, rowIndex, colIndex, newValue) => {
    const targetSec = sections.find(s => s.id === sectionId);
    if (!targetSec || !targetSec.table) return;

    const updatedRows = targetSec.table.rows.map((row, rIdx) => {
      if (rIdx === rowIndex) {
        return row.map((cell, cIdx) => (cIdx === colIndex ? newValue : cell));
      }
      return row;
    });

    onUpdateSection(sectionId, {
      table: {
        ...targetSec.table,
        rows: updatedRows
      }
    });
  };

  const handleTableHeaderEdit = (sectionId, colIndex, newValue) => {
    const targetSec = sections.find(s => s.id === sectionId);
    if (!targetSec || !targetSec.table) return;

    const updatedHeaders = targetSec.table.headers.map((h, cIdx) => (cIdx === colIndex ? newValue : h));
    onUpdateSection(sectionId, {
      table: {
        headers: updatedHeaders,
        rows: targetSec.table.rows
      }
    });
  };

  const handleRemoveImage = (sectionId, imageId) => {
    const targetSec = sections.find(s => s.id === sectionId);
    if (!targetSec) return;

    onUpdateSection(sectionId, {
      images: targetSec.images.filter(img => img.id !== imageId)
    });
  };

  const handleExpandImage = (sectionId, imageId) => {
    const targetSec = sections.find(s => s.id === sectionId);
    if (!targetSec) return;

    onUpdateSection(sectionId, {
      images: targetSec.images.map((img) => {
        if (img.id !== imageId) return img;
        const nextSize = img.size === 'small' ? 'medium' : 'large';
        return { ...img, size: nextSize };
      })
    });
  };

  const handleMinimizeImage = (sectionId, imageId) => {
    const targetSec = sections.find(s => s.id === sectionId);
    if (!targetSec) return;

    onUpdateSection(sectionId, {
      images: targetSec.images.map((img) => {
        if (img.id !== imageId) return img;
        const nextSize = img.size === 'large' ? 'medium' : 'small';
        return { ...img, size: nextSize };
      })
    });
  };

  const handleCropImageSave = (croppedDataUrl) => {
    if (!cropTarget) return;
    const { sectionId, img } = cropTarget;
    const targetSec = sections.find(s => s.id === sectionId);
    if (!targetSec) return;

    onUpdateSection(sectionId, {
      images: targetSec.images.map((i) => (i.id === img.id ? { ...i, url: croppedDataUrl } : i))
    });

    setCropTarget(null);
  };

  const handleRemoveVideo = (sectionId, videoId) => {
    const targetSec = sections.find(s => s.id === sectionId);
    if (!targetSec) return;

    onUpdateSection(sectionId, {
      videos: (targetSec.videos || []).filter(vid => vid.id !== videoId)
    });
  };

  const handleAddUrl = (sectionId) => {
    if (!urlLink) return;
    const targetSec = sections.find(s => s.id === sectionId);
    if (!targetSec) return;

    const newUrl = {
      id: 'url-' + Date.now(),
      title: urlTitle || urlLink,
      link: urlLink
    };

    onUpdateSection(sectionId, {
      urls: [...(targetSec.urls || []), newUrl]
    });

    setUrlLink('');
    setUrlTitle('');
    setShowUrlModalSectionId(null);
  };

  const handleRemoveUrl = (sectionId, urlId) => {
    const targetSec = sections.find(s => s.id === sectionId);
    if (!targetSec) return;

    onUpdateSection(sectionId, {
      urls: targetSec.urls.filter(u => u.id !== urlId)
    });
  };

  // Format raw text lines to initial HTML structure
  const formatInitialHtml = (rawContent) => {
    if (!rawContent) return '';
    if (rawContent.includes('<p>') || rawContent.includes('<ul>') || rawContent.includes('<ol>') || rawContent.includes('<li>') || rawContent.includes('<pre>')) {
      return rawContent;
    }

    const lines = rawContent.split('\n');
    let html = '';
    let inList = false;
    let listType = 'ul';

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        if (inList) { html += `</${listType}>`; inList = false; }
        return;
      }

      if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
        if (!inList || listType !== 'ul') {
          if (inList) html += `</${listType}>`;
          html += '<ul>';
          inList = true;
          listType = 'ul';
        }
        html += `<li>${trimmed.replace(/^([•\-]\s*)/, '')}</li>`;
      } else if (/^\d+\.\s/.test(trimmed)) {
        if (!inList || listType !== 'ol') {
          if (inList) html += `</${listType}>`;
          html += '<ol>';
          inList = true;
          listType = 'ol';
        }
        html += `<li>${trimmed.replace(/^\d+\.\s*/, '')}</li>`;
      } else {
        if (inList) { html += `</${listType}>`; inList = false; }
        html += `<p>${trimmed}</p>`;
      }
    });

    if (inList) html += `</${listType}>`;
    return html;
  };

  return (
    <div 
      className={`doc-page transition-all duration-300 ease-in-out bg-white border border-slate-200/90 ${
        layoutMode === 'a4'
          ? 'min-h-[1050px] p-8 sm:p-12 shadow-xl rounded-md mode-a4'
          : 'min-h-[600px] p-6 sm:p-10 md:p-14 shadow-md rounded-xl mode-landscape'
      }`}
    >
      
      {/* Continuous Word Canvas Flow */}
      <div className="sections-outer-flow" style={{ fontFamily }}>
        {sections.map((section, index) => {
          const hasImages = Boolean(section.images && section.images.length > 0);
          const hasVideos = Boolean(section.videos && section.videos.length > 0);
          const hasUrls = Boolean(section.urls && section.urls.length > 0);
          const hasTable = Boolean(section.table);

          const defaultNum = section.number !== undefined && section.number !== null ? section.number : `${index + 1}.`;
          const level = section.level || 1;
          const headingSizeClass = 
            level === 1 ? 'text-xl font-bold text-slate-900' :
            level === 2 ? 'text-lg font-bold text-slate-800' :
            level === 3 ? 'text-base font-semibold text-slate-700' :
            'text-sm font-semibold text-slate-600';

          const indentClass = 
            level === 2 ? 'pl-4 border-l-2 border-slate-200' :
            level === 3 ? 'pl-8 border-l-2 border-slate-100' :
            level >= 4 ? 'pl-12 border-l-2 border-slate-100' : '';

          return (
            <div 
              key={section.id} 
              className={`section-block group relative mb-3 ${indentClass}`}
              onClick={() => onSectionFocus && onSectionFocus(section.id)}
            >
              
              {/* Heading Row - 100% Inline Editable Number & Title */}
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex-1 flex items-center gap-1.5">
                  
                  {/* Serial Number - 100% Inline Editable or Removable */}
                  {defaultNum ? (
                    <EditableContent
                      html={defaultNum}
                      onFocus={() => onSectionFocus && onSectionFocus(section.id)}
                      onChange={(newVal) => onUpdateSection(section.id, { number: newVal })}
                      className={`doc-heading-number editable-number ${headingSizeClass} leading-tight outline-none py-0.5 px-1 rounded hover:bg-slate-100 focus:bg-blue-50/80 focus:ring-1 focus:ring-blue-400 font-sans cursor-text`}
                      title="Click to edit or remove section number (e.g. '1.', '1.1', 'A.', or leave empty)"
                    />
                  ) : null}

                  {/* Heading Title - 100% Inline Editable */}
                  <EditableContent
                    html={section.title}
                    onFocus={() => onSectionFocus && onSectionFocus(section.id)}
                    onChange={(newVal) => onUpdateSection(section.id, { title: newVal })}
                    className={`doc-heading-main w-full editable-heading bg-transparent outline-none py-0.5 px-1 rounded hover:bg-slate-50 focus:bg-slate-50 focus:ring-2 focus:ring-blue-500/20 ${headingSizeClass} leading-tight cursor-text`}
                    style={{ fontFamily }}
                  />
                </div>

                {/* Section Quick Upload Actions & Order Controls */}
                <div className="no-print flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <label className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer" title={`Upload Image to Section ${index + 1}`}>
                    <ImageIcon className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLocalImageUpload(e, section.id)}
                      className="hidden"
                    />
                  </label>

                  <label className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer" title={`Upload Video to Section ${index + 1}`}>
                    <VideoIcon className="w-4 h-4" />
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleLocalVideoUpload(e, section.id)}
                      className="hidden"
                    />
                  </label>

                  <div className="h-3 w-px bg-slate-300 mx-0.5" />

                  <button
                    onClick={() => onReorderSection(index, index - 1)}
                    disabled={index === 0}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onReorderSection(index, index + 1)}
                    disabled={index === sections.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onRemoveSection(section.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                    title="Delete Section"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Seamless Rich Text Body Paragraphs - 100% Inline Editable (Preserves Selection) */}
              <div className="pl-1 space-y-1">
                <EditableContent
                  html={formatInitialHtml(section.content)}
                  onFocus={() => onSectionFocus && onSectionFocus(section.id)}
                  onChange={(newHtml) => onUpdateSection(section.id, { content: newHtml })}
                  className="doc-body-text outline-none p-1 rounded hover:bg-slate-50/50 focus:bg-slate-50/50 focus:ring-1 focus:ring-blue-400 text-slate-800 leading-relaxed min-h-[40px] cursor-text"
                  style={{ textAlign: section.textAlign || 'left', fontSize, fontFamily }}
                />

                {/* Render Images */}
                {hasImages && (
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                    {section.images.map((img) => {
                      const sizeClass = 
                        img.size === 'small' 
                          ? 'col-span-1 max-w-xs h-40 object-contain sm:object-cover' 
                          : img.size === 'large' 
                          ? 'col-span-1 sm:col-span-2 w-full h-[400px] object-cover' 
                          : 'col-span-1 w-full h-64 object-cover';

                      const wrapperClass =
                        img.size === 'large'
                          ? 'col-span-1 sm:col-span-2'
                          : 'col-span-1';

                      return (
                        <div key={img.id} className={`relative group/img border border-slate-200 rounded-lg overflow-hidden bg-slate-50 print:border-none transition-all duration-300 ${wrapperClass}`}>
                          <img 
                            src={img.url} 
                            alt="Uploaded content" 
                            className={`w-full ${sizeClass} transition-all duration-300 print:h-auto print:max-h-[380px]`} 
                          />
                          
                          {/* Image Action Buttons Overlay: Crop, Expand, Minimize, Delete */}
                          <div className="no-print export-hide absolute top-2 right-2 flex items-center gap-1 bg-slate-900/85 backdrop-blur-xs p-1 rounded-lg opacity-0 group-hover/img:opacity-100 transition-opacity shadow-md z-10">
                            <button
                              type="button"
                              onClick={() => setCropTarget({ sectionId: section.id, img })}
                              className="p-1 text-slate-200 hover:text-white hover:bg-slate-700 rounded transition-colors"
                              title="Crop Image"
                            >
                              <Crop className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleExpandImage(section.id, img.id)}
                              className="p-1 text-slate-200 hover:text-white hover:bg-slate-700 rounded transition-colors"
                              title="Expand Image Size"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMinimizeImage(section.id, img.id)}
                              className="p-1 text-slate-200 hover:text-white hover:bg-slate-700 rounded transition-colors"
                              title="Minimize Image Size"
                            >
                              <Minimize2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(section.id, img.id)}
                              className="p-1 text-rose-400 hover:text-rose-200 hover:bg-rose-900/60 rounded transition-colors"
                              title="Remove Image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Render Videos */}
                {hasVideos && (
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {section.videos.map((vid) => (
                      <div key={vid.id} className="relative group/vid border border-slate-200 rounded-lg overflow-hidden bg-slate-900 print:border-none">
                        <video 
                          controls 
                          src={vid.url} 
                          className="w-full h-44 object-cover" 
                        />
                        {vid.caption && (
                          <EditableContent
                            html={vid.caption}
                            className="p-1.5 text-xs text-slate-200 bg-slate-800 text-center font-medium italic outline-none cursor-text"
                          />
                        )}
                        <button
                          onClick={() => handleRemoveVideo(section.id, vid.id)}
                          className="no-print export-hide absolute top-2 right-2 bg-rose-600 text-white p-1 rounded-full shadow hover:bg-rose-700 transition-colors cursor-pointer"
                          title="Remove Video"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Render URLs */}
                {hasUrls && (
                  <div className="mt-2 space-y-1">
                    {section.urls.map((urlItem) => (
                      <div key={urlItem.id} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-1.5 print:bg-transparent print:border-none print:p-0">
                        <a 
                          href={urlItem.link} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex items-center gap-2 text-xs font-semibold text-blue-600 hover:underline print:text-blue-700"
                        >
                          <ExternalLink className="w-3.5 h-3.5 no-print export-hide" />
                          <span>{urlItem.title || urlItem.link}</span>
                        </a>
                        <button
                          onClick={() => handleRemoveUrl(section.id, urlItem.id)}
                          className="no-print export-hide text-slate-400 hover:text-rose-600 p-0.5"
                          title="Remove Link"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Render Editable Table */}
                {hasTable && (
                  <div className="mt-2 space-y-1.5">
                    <div className="no-print export-hide flex items-center justify-between text-xs text-slate-500 font-semibold bg-slate-100 p-1.5 rounded-t-md">
                      <span>Document Table</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAddTableRow(section.id)}
                          className="bg-white border border-slate-300 text-slate-700 px-2 py-0.5 rounded text-[11px] hover:bg-slate-50"
                        >
                          + Add Row
                        </button>
                        <button
                          onClick={() => handleAddTableCol(section.id)}
                          className="bg-white border border-slate-300 text-slate-700 px-2 py-0.5 rounded text-[11px] hover:bg-slate-50"
                        >
                          + Add Column
                        </button>
                        <button
                          onClick={() => handleRemoveTable(section.id)}
                          className="text-rose-600 hover:underline text-[11px] ml-2"
                        >
                          Remove Table
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="doc-table" style={{ fontFamily }}>
                        <thead>
                          <tr>
                            {section.table.headers.map((h, hIdx) => (
                              <th key={hIdx} className="relative group/col">
                                <div className="flex items-center justify-between gap-1.5">
                                  <EditableContent
                                    html={h}
                                    onChange={(newVal) => handleTableHeaderEdit(section.id, hIdx, newVal)}
                                    className="w-full font-bold text-slate-900 outline-none cursor-text"
                                    style={{ fontFamily }}
                                  />
                                  <button
                                    onClick={() => handleDeleteTableCol(section.id, hIdx)}
                                    className="no-print export-hide text-slate-400 hover:text-rose-600 p-0.5 shrink-0 cursor-pointer"
                                    title="Delete Column"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </th>
                            ))}
                            <th className="no-print export-hide w-8"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {section.table.rows.map((row, rIdx) => (
                            <tr key={rIdx}>
                              {row.map((cell, cIdx) => (
                                <td key={cIdx}>
                                  <EditableContent
                                    html={cell}
                                    onChange={(newVal) => handleTableCellEdit(section.id, rIdx, cIdx, newVal)}
                                    className="w-full outline-none text-xs text-slate-800 focus:bg-blue-50/50 p-0.5 rounded cursor-text"
                                    style={{ fontFamily }}
                                  />
                                </td>
                              ))}
                              <td className="no-print export-hide text-center">
                                <button
                                  onClick={() => handleDeleteTableRow(section.id, rIdx)}
                                  className="text-slate-400 hover:text-rose-600 p-0.5"
                                  title="Delete Row"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>

              {/* Section Inserter Bar */}
              <div className="no-print my-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <div className="h-px bg-slate-200 flex-1" />
                <button
                  onClick={() => onInsertSectionAfter(index)}
                  className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-0.5 rounded-full font-semibold transition-all"
                >
                  <Plus className="w-3 h-3" />
                  <span>Insert Section Here</span>
                </button>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              {/* Modals for URL */}
              {showUrlModalSectionId === section.id && (
                <div className="no-print fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <LinkIcon className="w-5 h-5 text-blue-600" />
                      Insert Web Link Bookmark
                    </h3>

                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Target URL</label>
                      <input
                        type="url"
                        value={urlLink}
                        onChange={(e) => setUrlLink(e.target.value)}
                        placeholder="https://tekquora.com"
                        className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Display Title</label>
                      <input
                        type="text"
                        value={urlTitle}
                        onChange={(e) => setUrlTitle(e.target.value)}
                        placeholder="e.g. TekQuora Website Portal"
                        className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => setShowUrlModalSectionId(null)}
                        className="text-xs text-slate-500 hover:text-slate-700 px-3 py-2"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAddUrl(section.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs"
                      >
                        Add Link
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Image Crop Modal */}
      {cropTarget && (
        <ImageCropModal
          imageUrl={cropTarget.img.url}
          onSave={handleCropImageSave}
          onClose={() => setCropTarget(null)}
        />
      )}
    </div>
  );
}
