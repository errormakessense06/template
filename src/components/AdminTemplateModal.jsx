import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  MoveUp, 
  MoveDown, 
  Save, 
  Copy, 
  Sparkles,
  Sliders,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';

export default function AdminTemplateModal({
  isOpen,
  onClose,
  activeTemplate,
  onSaveTemplate,
  onDuplicateTemplate
}) {
  if (!isOpen) return null;

  const [templateName, setTemplateName] = useState(activeTemplate.name);
  const [sections, setSections] = useState([...activeTemplate.sections]);
  const [branding, setBranding] = useState({ ...activeTemplate.branding });

  const [newSectionTitle, setNewSectionTitle] = useState('');

  // Add Section
  const handleAddSection = () => {
    if (!newSectionTitle.trim()) return;
    const newSec = {
      id: 'sec-' + Date.now(),
      number: String(sections.length + 1),
      title: newSectionTitle.trim(),
      isFixed: true,
      content: '',
      images: [],
      urls: []
    };
    setSections([...sections, newSec]);
    setNewSectionTitle('');
  };

  // Reorder Sections
  const handleMove = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= sections.length) return;
    const updated = [...sections];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    
    // Re-number
    const renumbered = updated.map((sec, idx) => ({
      ...sec,
      number: String(idx + 1)
    }));
    setSections(renumbered);
  };

  // Delete Section
  const handleDelete = (id) => {
    const filtered = sections.filter(s => s.id !== id).map((sec, idx) => ({
      ...sec,
      number: String(idx + 1)
    }));
    setSections(filtered);
  };

  // Save Template
  const handleSave = () => {
    onSaveTemplate({
      ...activeTemplate,
      name: templateName,
      branding,
      sections
    });
    onClose();
  };

  // Save as New Template
  const handleDuplicate = () => {
    onDuplicateTemplate({
      id: 'tpl-' + Date.now(),
      name: `${templateName} (Copy)`,
      version: '1.0',
      branding,
      sections
    });
    onClose();
  };

  return (
    <div className="no-print fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Sliders className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Admin Template & Heading CMS Portal</h2>
              <p className="text-xs text-slate-400">Configure constant headings, logo & fixed page templates</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Template Details */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Template Metadata</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Template Name</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full text-xs font-semibold border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Cover Page Logo URL (Optional)</label>
                <input
                  type="text"
                  value={branding.logoUrl || ''}
                  onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
                  placeholder="Default: Standard TekQuora SVG Logo"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Constant Headings Manager */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Fixed Template Headings ({sections.length})
              </h3>
              <span className="text-[11px] text-purple-600 font-medium bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Non-admin users can fill content under these headings
              </span>
            </div>

            {/* Headings List */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {sections.map((sec, idx) => (
                <div 
                  key={sec.id}
                  className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center font-serif">
                      {sec.number || idx + 1}
                    </span>
                    <input
                      type="text"
                      value={sec.title}
                      onChange={(e) => {
                        const updated = [...sections];
                        updated[idx].title = e.target.value;
                        setSections(updated);
                      }}
                      className="flex-1 text-xs font-bold text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-purple-600 outline-none px-1 py-0.5"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMove(idx, idx - 1)}
                      disabled={idx === 0}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      title="Move Up"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(idx, idx + 1)}
                      disabled={idx === sections.length - 1}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      title="Move Down"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(sec.id)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                      title="Delete Heading"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Heading Row */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSection()}
                placeholder="Enter new standard section heading name..."
                className="flex-1 text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleAddSection}
                className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Heading
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleDuplicate}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-purple-700 bg-white border border-slate-300 hover:border-purple-300 px-3.5 py-2 rounded-lg transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            Save as Copy Template
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-700 px-4 py-2"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Template Changes
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
