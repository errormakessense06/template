import React, { useRef } from 'react';
import TekQuoraLogo from './TekQuoraLogo';
import { Upload } from 'lucide-react';

export default function CoverPage({ branding, onUpdateBranding, fontFamily }) {
  const fileInputRef = useRef(null);

  const handleChange = (field, htmlValue) => {
    if (onUpdateBranding) {
      onUpdateBranding({
        ...branding,
        [field]: htmlValue
      });
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        handleChange('logoUrl', ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="doc-page cover-page-print flex flex-col justify-between select-text relative h-auto min-h-[900px] p-8 sm:p-12 border border-slate-200 shadow-sm rounded-lg bg-white mb-6" style={{ fontFamily }}>
      
      {/* Top Header / Logo Section */}
      <div className="pt-4 pb-4 text-center flex flex-col items-center justify-center">
        <div className="relative group/logo">
          {branding.logoUrl ? (
            <img 
              src={branding.logoUrl} 
              alt="Company Logo" 
              className="h-28 max-w-sm object-contain mb-2" 
            />
          ) : (
            <TekQuoraLogo className="mb-2" />
          )}

          {/* Change Logo Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="no-print opacity-0 group-hover/logo:opacity-100 transition-opacity bg-slate-900/80 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md mx-auto mt-2 cursor-pointer"
            title="Upload custom logo image"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Change Logo</span>
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleLogoUpload}
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>

      {/* Middle Document Title & Subtitle - 100% Inline Editable */}
      <div className="my-auto text-center px-6 py-6 flex-1 flex flex-col items-center justify-center space-y-4">
        
        {/* Header Tagline */}
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleChange('headerTagline', e.currentTarget.innerHTML)}
          dangerouslySetInnerHTML={{ __html: branding.headerTagline || 'FULL CONTENT PARAGRAPHS (ENGLISH)' }}
          className="w-full text-center text-xs font-bold text-slate-400 uppercase tracking-widest outline-none py-1 px-2 hover:bg-slate-50 focus:bg-slate-50 focus:ring-1 focus:ring-blue-400 rounded"
        />

        {/* Main Cover Title */}
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleChange('title', e.currentTarget.innerHTML)}
          dangerouslySetInnerHTML={{ __html: branding.title || 'TekQuora Corporate Website & Content Management System (CMS)' }}
          className="w-full max-w-3xl text-center text-2xl sm:text-3xl font-bold text-slate-900 font-serif outline-none py-2 px-3 hover:bg-slate-50 focus:bg-slate-50 focus:ring-2 focus:ring-blue-500/20 rounded-lg leading-relaxed"
        />

        {/* Document Subtitle */}
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleChange('subtitle', e.currentTarget.innerHTML)}
          dangerouslySetInnerHTML={{ __html: branding.subtitle || 'Comprehensive Project Requirements & System Specification' }}
          className="w-full max-w-xl text-center text-sm sm:text-base font-medium text-slate-600 font-serif outline-none py-1 px-2 hover:bg-slate-50 focus:bg-slate-50 focus:ring-1 focus:ring-blue-400 rounded"
        />
      </div>

      {/* Bottom Metadata Section - 100% Inline Editable */}
      <div className="pt-6 pb-4 border-t border-slate-200 space-y-6">
        <div className="flex items-start justify-between text-base font-serif px-2 gap-4">
          
          {/* Prepared By */}
          <div className="space-y-1 text-left flex-1">
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleChange('preparedByLabel', e.currentTarget.innerHTML)}
              dangerouslySetInnerHTML={{ __html: branding.preparedByLabel || 'Prepared By' }}
              className="font-bold text-slate-900 text-sm sm:text-base outline-none hover:bg-slate-50 focus:bg-slate-50 rounded px-1"
            />
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleChange('preparedBy', e.currentTarget.innerHTML)}
              dangerouslySetInnerHTML={{ __html: branding.preparedBy || 'TekQuora' }}
              className="text-slate-800 font-medium text-sm sm:text-base outline-none hover:bg-slate-50 focus:bg-slate-50 rounded px-1"
            />
          </div>

          {/* Prepared For */}
          <div className="space-y-1 text-right flex-1">
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleChange('preparedForLabel', e.currentTarget.innerHTML)}
              dangerouslySetInnerHTML={{ __html: branding.preparedForLabel || 'Prepared For' }}
              className="font-bold text-slate-900 text-sm sm:text-base outline-none hover:bg-slate-50 focus:bg-slate-50 rounded px-1 text-right"
            />
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleChange('preparedFor', e.currentTarget.innerHTML)}
              dangerouslySetInnerHTML={{ __html: branding.preparedFor || 'TekQuora Pvt. Ltd.' }}
              className="text-slate-800 font-medium text-sm sm:text-base outline-none hover:bg-slate-50 focus:bg-slate-50 rounded px-1 text-right"
            />
          </div>

        </div>

        {/* Version & Date Rows */}
        <div className="space-y-2 text-sm sm:text-base font-serif px-2 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2">
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleChange('versionLabel', e.currentTarget.innerHTML)}
              dangerouslySetInnerHTML={{ __html: branding.versionLabel || 'Version:' }}
              className="font-bold text-slate-900 outline-none hover:bg-slate-50 rounded px-1"
            />
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleChange('version', e.currentTarget.innerHTML)}
              dangerouslySetInnerHTML={{ __html: branding.version || '1.0' }}
              className="text-slate-800 outline-none hover:bg-slate-50 rounded px-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleChange('dateLabel', e.currentTarget.innerHTML)}
              dangerouslySetInnerHTML={{ __html: branding.dateLabel || 'Submitted Date:' }}
              className="font-bold text-slate-900 outline-none hover:bg-slate-50 rounded px-1"
            />
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleChange('submittedDate', e.currentTarget.innerHTML)}
              dangerouslySetInnerHTML={{ __html: branding.submittedDate || 'July 2026' }}
              className="text-slate-800 outline-none hover:bg-slate-50 rounded px-1"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
