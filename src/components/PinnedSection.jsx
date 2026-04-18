import React from 'react';
import ClipItem from './ClipItem.jsx';
import { t } from '../i18n/translations.js';

export default function PinnedSection({ clips, selectedId, onClick, onTogglePin, onRemove, language = 'es' }) {
  if (!clips || clips.length === 0) return null;
  return (
    <div>
      <div className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-neutral-400 dark:text-white/30 font-semibold flex items-center gap-1.5">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        {t('pinned.title', language)}
      </div>
      {clips.map((c) => (
        <ClipItem
          key={c.id}
          clip={c}
          selected={c.id === selectedId}
          onClick={() => onClick(c.id)}
          onTogglePin={() => onTogglePin(c.id)}
          onRemove={() => onRemove(c.id)}
          language={language}
        />
      ))}
      <div className="border-t border-white/5 my-1" />
    </div>
  );
}
