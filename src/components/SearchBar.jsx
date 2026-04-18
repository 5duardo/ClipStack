import React, { forwardRef } from 'react';
import { t } from '../i18n/translations.js';

const SearchBar = forwardRef(function SearchBar({ value, onChange, onKeyDown, language = 'es' }, ref) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-200 dark:border-white/10">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-neutral-400 dark:text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={t('search.placeholder', language)}
        className="flex-1 bg-transparent outline-none text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-white/30 text-sm"
        autoFocus
      />
      <kbd className="text-[10px] text-neutral-400 dark:text-white/30 border border-neutral-200 dark:border-white/10 rounded px-1.5 py-0.5">ESC</kbd>
    </div>
  );
});

export default SearchBar;
