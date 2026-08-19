import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { findDocumentMatches } from '../utils/documentSearch';

export default function NavigationPane({ sections, onClose, onNavigate, onSearchChange }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [tab, setTab] = useState('headings');
  const [activeResultId, setActiveResultId] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query.trim()), 150);
    return () => clearTimeout(timeout);
  }, [query]);

  const results = useMemo(
    () => findDocumentMatches(sections, debouncedQuery),
    [sections, debouncedQuery]
  );

  useEffect(() => {
    setActiveResultId(null);
  }, [debouncedQuery]);

  const selectResult = (result) => {
    setActiveResultId(result.id);
    onNavigate(result);
  };

  const activeIndex = results.findIndex((result) => result.id === activeResultId);
  const navigateRelative = (direction) => {
    if (!results.length) return;
    const index = activeIndex < 0
      ? (direction > 0 ? 0 : results.length - 1)
      : (activeIndex + direction + results.length) % results.length;
    selectResult(results[index]);
  };

  const handleQueryChange = (value) => {
    setQuery(value);
    setActiveResultId(null);
    onSearchChange(); // Clears a prior document highlight immediately.
    if (value.trim()) setTab('results');
  };

  return (
    <aside className="no-print w-80 max-w-[85vw] shrink-0 self-start sticky top-2 max-h-[calc(100vh-1rem)] bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden flex flex-col">
      <div className="p-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') navigateRelative(event.shiftKey ? -1 : 1);
              }}
              className="w-full rounded-lg border border-slate-300 py-2 pl-8 pr-7 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Search document"
              aria-label="Search document"
            />
            {query && <button type="button" onClick={() => handleQueryChange('')} aria-label="Clear search" className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"><X className="w-3.5 h-3.5" /></button>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close document navigation" className="p-1.5 rounded text-slate-500 hover:bg-slate-100 hover:text-slate-800"><X className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="flex border-b border-slate-200 px-2">
        {[['headings', 'Headings'], ['pages', 'Pages'], ['results', 'Results']].map(([id, label]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={`flex-1 py-2 text-xs font-bold border-b-2 ${tab === id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>{label}</button>
        ))}
      </div>

      {tab === 'headings' && <div className="overflow-y-auto p-2">
        <p className="px-2 py-1 text-[10px] font-bold tracking-wider text-slate-400">HEADINGS</p>
        {sections.map((section, index) => <button key={section.id} type="button" onClick={() => onNavigate({ sectionId: section.id })} className="w-full text-left rounded-lg px-2 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-800"><span className="font-semibold mr-1.5">{index + 1}.</span>{section.title.replace(/<[^>]*>/g, '')}</button>)}
      </div>}

      {tab === 'pages' && <div className="p-4 text-sm text-slate-500 leading-relaxed">Page navigation is unavailable because this editor uses a continuous document canvas.</div>}

      {tab === 'results' && <div className="overflow-y-auto p-2">
        {!debouncedQuery ? <p className="p-3 text-sm text-slate-500">Type to search the document.</p> : <>
          <div className="px-2 py-1.5 flex items-center justify-between text-xs text-slate-500"><span>{results.length} match{results.length === 1 ? '' : 'es'}</span>{results.length > 0 && <span className="flex items-center gap-1"><button type="button" onClick={() => navigateRelative(-1)} aria-label="Previous match" className="p-1 hover:text-blue-700"><ChevronLeft className="w-4 h-4" /></button><span>{activeIndex + 1 || 0} of {results.length}</span><button type="button" onClick={() => navigateRelative(1)} aria-label="Next match" className="p-1 hover:text-blue-700"><ChevronRight className="w-4 h-4" /></button></span>}</div>
          {results.map((result) => <button key={result.id} type="button" onClick={() => selectResult(result)} className={`w-full text-left rounded-lg px-2 py-2 mb-1 ${activeResultId === result.id ? 'bg-blue-100' : 'hover:bg-slate-100'}`}><p className="text-xs font-bold text-slate-700">{result.sectionNumber}. {result.sectionTitle}</p><p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{result.excerpt}</p></button>)}
          {!results.length && <p className="p-3 text-sm text-slate-500">No matches found.</p>}
        </>}
      </div>}
    </aside>
  );
}
