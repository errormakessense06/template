import React, { useState, useRef } from 'react';
import { 
  Undo, 
  Redo, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Sparkles, 
  Image as ImageIcon, 
  Video, 
  Quote, 
  Minus, 
  Smile, 
  Check, 
  Eye, 
  Save, 
  Palette, 
  Highlighter, 
  Wand2,
  Table as TableIcon,
  PlusCircle,
  X,
  FileText,
  Maximize2,
  RotateCcw
} from 'lucide-react';

const BACKEND_URL = 'http://localhost:5001';

export default function Toolbar({
  activeTemplate,
  templates,
  onSelectTemplate,
  onAddSection,
  onPrint,
  onExportWord,
  onSaveDocument,
  isSaving,
  onReset,
  onClearAllContent,
  isSaved,
  backendConnected,
  onApplyFormatToActive,
  onInsertImageFile,
  onInsertVideoFile,
  onInsertTableToActive,
  onInsertUrlToActive,
  fontSize,
  setFontSize,
  fontFamily,
  setFontFamily,
  textAlign,
  setTextAlign,
  onAiGenerate,
  layoutMode = 'a4',
  onLayoutModeChange,
  autoSaveEnabled = true,
  onToggleAutoSave
}) {
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState('');

  // Hidden File Inputs for Native Local Image & Video Pickers
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Selection-based Formatter preserving bold, italic, underline, links & syncing React state
  const applySelectionFormat = (command, value = null) => {
    try {
      document.execCommand(command, false, value);
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.isContentEditable || activeEl.getAttribute('contenteditable') === 'true')) {
        activeEl.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } catch (e) {
      console.warn('execCommand formatting error:', e);
      if (onApplyFormatToActive) {
        onApplyFormatToActive(command, value);
      }
    }
  };

  const handleFontFamilyChange = (e) => {
    const font = e.target.value;
    setFontFamily(font);
    document.execCommand('fontName', false, font);
  };

  const handleFontSizeChange = (e) => {
    const size = e.target.value;
    setFontSize(size);
    const sizeMap = { '12px': '2', '14px': '3', '16px': '4', '18px': '5', '24px': '6' };
    document.execCommand('fontSize', false, sizeMap[size] || '4');
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
          onInsertImageFile(data.file.url, file.name);
          e.target.value = '';
          return;
        }
      }
    } catch (err) {
      console.warn('Backend upload fallback:', err);
    }

    try {
      const objectUrl = URL.createObjectURL(file);
      onInsertImageFile(objectUrl, file.name);
    } catch (err) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        onInsertImageFile(ev.target.result, file.name);
      };
      reader.readAsDataURL(file);
    }

    e.target.value = '';
  };

  const handleVideoFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
          onInsertVideoFile(data.file.url, file.name);
          e.target.value = '';
          return;
        }
      }
    } catch (err) {
      console.warn('Backend upload fallback:', err);
    }

    try {
      const objectUrl = URL.createObjectURL(file);
      onInsertVideoFile(objectUrl, file.name);
    } catch (err) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        onInsertVideoFile(ev.target.result, file.name);
      };
      reader.readAsDataURL(file);
    }

    e.target.value = '';
  };

  const handleRunAi = async () => {
    if (isGenerating) return;
    if (!aiPrompt.trim()) {
      setAiError('Paste some content before generating.');
      return;
    }
    setIsGenerating(true);
    setAiError('');
    try {
      await onAiGenerate(aiPrompt.trim());
      setIsGenerating(false);
      setShowAiModal(false);
      setAiPrompt('');
    } catch (err) {
      setAiError(err.message || 'AI generation failed. Please try again.');
      setIsGenerating(false);
    }
  };

  return (
    <header className="no-print sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs px-4 py-3">
      <div className="max-w-7xl mx-auto space-y-3">
        
        {/* TOP ROW */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div>
                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">
                  FULL CONTENT PARAGRAPHS (ENGLISH)
                </span>
                <h1 className="font-bold text-slate-800 text-sm leading-none">
                  Text editor
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggleAutoSave}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all hidden md:flex items-center gap-1.5 cursor-pointer select-none ${
                autoSaveEnabled
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
              }`}
              title={autoSaveEnabled ? "Auto-save is ON. Click to turn OFF." : "Auto-save is OFF. Click to turn ON."}
            >
              <div className={`w-5.5 h-3 flex items-center rounded-full p-0.5 transition-colors ${
                autoSaveEnabled ? 'bg-emerald-600 justify-end' : 'bg-slate-400 justify-start'
              }`}>
                <div className="w-2 h-2 bg-white rounded-full shadow-xs" />
              </div>
              
              <span>
                {autoSaveEnabled 
                  ? (isSaved ? 'Auto-save ON' : 'Saving...') 
                  : 'Auto-save OFF'}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Layout Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-300 shadow-2xs">
              <button
                type="button"
                onClick={() => onLayoutModeChange && onLayoutModeChange('a4')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  layoutMode === 'a4'
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to A4 Digital Sheet View"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>A4 Size</span>
              </button>

              <button
                type="button"
                onClick={() => onLayoutModeChange && onLayoutModeChange('landscape')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  layoutMode === 'landscape'
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to Fluid Landscape Fullscreen View"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Landscape</span>
              </button>
            </div>

            <button
              onClick={() => { setAiError(''); setShowAiModal(true); }}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold tracking-wider uppercase px-4 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
              title="Generate document content using AI"
            >
              <Sparkles className="w-4 h-4 text-amber-100" />
              <span>✨ GENERATE WITH AI</span>
            </button>
          </div>

        </div>

        {/* MAIN FORMATTING RIBBON BAR */}
        <div className="bg-slate-50 border border-slate-300 rounded-xl p-1.5 flex flex-wrap items-center justify-between gap-1 shadow-2xs">
          
          <div className="flex flex-wrap items-center gap-1 text-slate-700 text-xs">
            
            {/* History */}
            <div className="flex items-center gap-0.5">
              <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applySelectionFormat('undo')}
                className="p-1.5 hover:bg-white hover:shadow-2xs rounded text-slate-600 transition-all cursor-pointer" 
                title="Undo"
              >
                <Undo className="w-3.5 h-3.5" />
              </button>
              <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applySelectionFormat('redo')}
                className="p-1.5 hover:bg-white hover:shadow-2xs rounded text-slate-600 transition-all cursor-pointer" 
                title="Redo"
              >
                <Redo className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-4 w-px bg-slate-300 mx-1" />

            {/* Text Selection Formatting Controls */}
            <div className="flex items-center gap-0.5">
              <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applySelectionFormat('bold')}
                className="p-1.5 hover:bg-white hover:shadow-2xs rounded font-bold text-slate-800 transition-all cursor-pointer" 
                title="Bold Selected Text"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applySelectionFormat('italic')}
                className="p-1.5 hover:bg-white hover:shadow-2xs rounded italic text-slate-800 transition-all cursor-pointer" 
                title="Italic Selected Text"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applySelectionFormat('underline')}
                className="p-1.5 hover:bg-white hover:shadow-2xs rounded underline text-slate-800 transition-all cursor-pointer" 
                title="Underline Selected Text"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>
              <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applySelectionFormat('strikeThrough')}
                className="p-1.5 hover:bg-white hover:shadow-2xs rounded line-through text-slate-800 transition-all cursor-pointer" 
                title="Strikethrough Selected Text"
              >
                <Strikethrough className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-4 w-px bg-slate-300 mx-1" />

            {/* Font Size & Family */}
            <div className="flex items-center gap-1.5">
              <select
                value={fontSize}
                onChange={handleFontSizeChange}
                className="bg-white border border-slate-300 text-slate-800 text-xs rounded-md px-2 py-1 focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer"
              >
                <option value="12px">12px (Small)</option>
                <option value="14px">14px (Normal)</option>
                <option value="16px">16px (Medium)</option>
                <option value="18px">18px (Large)</option>
                <option value="24px">24px (Title)</option>
              </select>

              <select
                value={fontFamily}
                onChange={handleFontFamilyChange}
                className="bg-white border border-slate-300 text-slate-800 text-xs rounded-md px-2.5 py-1 focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer"
              >
                <option value="Georgia">Georgia</option>
                <option value="Inter">Inter</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Arial">Arial</option>
                <option value="Courier New">Courier New</option>
                <option value="Merriweather">Merriweather</option>
              </select>
            </div>

            <div className="h-4 w-px bg-slate-300 mx-1" />

            {/* Alignments */}
            <div className="flex items-center gap-0.5">
              
              <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { setTextAlign('left'); applySelectionFormat('justifyLeft'); }}
                className={`p-1.5 rounded transition-all cursor-pointer ${textAlign === 'left' ? 'bg-white shadow-2xs text-blue-600' : 'hover:bg-white text-slate-700'}`} 
                title="Align Left"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { setTextAlign('center'); applySelectionFormat('justifyCenter'); }}
                className={`p-1.5 rounded transition-all cursor-pointer ${textAlign === 'center' ? 'bg-white shadow-2xs text-blue-600' : 'hover:bg-white text-slate-700'}`} 
                title="Align Center"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { setTextAlign('right'); applySelectionFormat('justifyRight'); }}
                className={`p-1.5 rounded transition-all cursor-pointer ${textAlign === 'right' ? 'bg-white shadow-2xs text-blue-600' : 'hover:bg-white text-slate-700'}`} 
                title="Align Right"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
              <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { setTextAlign('justify'); applySelectionFormat('justifyFull'); }}
                className={`p-1.5 rounded transition-all cursor-pointer ${textAlign === 'justify' ? 'bg-white shadow-2xs text-blue-600' : 'hover:bg-white text-slate-700'}`} 
                title="Justify"
              >
                <AlignJustify className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-4 w-px bg-slate-300 mx-1" />

            {/* Bullet Points & Numbered Lists Selection Controls */}
            <div className="flex items-center gap-0.5">
              <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applySelectionFormat('insertUnorderedList')}
                className="p-1.5 hover:bg-white hover:shadow-2xs rounded text-slate-700 transition-all cursor-pointer" 
                title="Convert Selection to Bullet List"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applySelectionFormat('insertOrderedList')}
                className="p-1.5 hover:bg-white hover:shadow-2xs rounded text-slate-700 transition-all cursor-pointer" 
                title="Convert Selection to Numbered List"
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-4 w-px bg-slate-300 mx-1" />

            {/* Media & Pickers */}
            <div className="flex items-center gap-0.5">
              <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={onInsertUrlToActive}
                className="p-1.5 hover:bg-white hover:shadow-2xs rounded text-slate-700 transition-all cursor-pointer" 
                title="Insert Link"
              >
                <LinkIcon className="w-3.5 h-3.5" />
              </button>

              {/* Native Local Image File Choice */}
              <button 
                onClick={() => imageInputRef.current?.click()}
                className="p-1.5 hover:bg-white hover:shadow-2xs rounded text-emerald-600 transition-all cursor-pointer" 
                title="Upload Image File"
              >
                <ImageIcon className="w-3.5 h-3.5" />
              </button>
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageFileChange}
                accept="image/*"
                className="hidden"
              />

              {/* Native Local Video File Choice */}
              <button 
                onClick={() => videoInputRef.current?.click()}
                className="p-1.5 hover:bg-white hover:shadow-2xs rounded text-rose-600 transition-all cursor-pointer" 
                title="Upload Video File"
              >
                <Video className="w-3.5 h-3.5" />
              </button>
              <input
                type="file"
                ref={videoInputRef}
                onChange={handleVideoFileChange}
                accept="video/*"
                className="hidden"
              />

              <button 
                onClick={onInsertTableToActive}
                className="p-1.5 hover:bg-white hover:shadow-2xs rounded text-slate-700 transition-all cursor-pointer" 
                title="Insert Table"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onAddSection}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-2xs transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Heading Section</span>
            </button>
          </div>

        </div>

        {/* BOTTOM ACTIONS BAR */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
          <div className="text-slate-500 font-medium flex items-center gap-2">
            <span>Font: <strong className="text-slate-700">{fontFamily}</strong></span>
            <span>•</span>
            <span>Size: <strong className="text-slate-700">{fontSize}</strong></span>
            <span>•</span>
            <span>Align: <strong className="text-slate-700 capitalize">{textAlign}</strong></span>
            <span>•</span>
            <span>Layout: <strong className="text-blue-600 capitalize">{layoutMode === 'a4' ? 'A4 Size' : 'Landscape'}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onPrint}
              className="flex items-center gap-1.5 bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold px-4 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
              title="Download PDF Document"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={onExportWord}
              className="flex items-center gap-1.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold px-4 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
              title="Download Microsoft Word Document (.doc)"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download Word</span>
            </button>



            <button
              onClick={onSaveDocument}
              disabled={isSaving}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'SAVING...' : 'SAVE & EXPORT'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* AI Prompt Modal */}
      {showAiModal && (
        <div className="no-print fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Import Document or Generate Content
              </h3>
              <button 
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Paste your document (Markdown, outlines, structured text, or rough notes). Structured text is imported directly as source-of-truth sections without rewriting.
            </p>

            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={8}
              placeholder="Paste your structured document (or rough notes) here..."
              className="w-full text-xs border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-amber-500 font-mono"
            />

            {aiError && (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2.5">
                {aiError}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAiModal(false)}
                disabled={isGenerating}
                className="text-xs text-slate-500 hover:text-slate-700 px-3 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleRunAi}
                disabled={isGenerating}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? 'Processing...' : 'Import / Generate Content'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
