import React, { useState } from 'react';
import { t } from '../i18n/translations.js';

const TYPE_OPTIONS = (language) => [
  { value: 'all', label: t('filters.all', language), icon: '📋' },
  { value: 'text', label: t('filters.text', language), icon: '📝' },
  { value: 'image', label: t('filters.image', language), icon: '🖼️' },
];

const DATE_OPTIONS = (language) => [
  { value: 'all', label: t('filters.always', language) },
  { value: 'today', label: t('filters.today', language) },
  { value: 'week', label: t('filters.week', language) },
  { value: 'month', label: t('filters.month', language) },
];

function isToday(date) {
  const now = new Date();
  const d = new Date(date);
  return d.toDateString() === now.toDateString();
}

function isThisWeek(date) {
  const now = new Date();
  const d = new Date(date);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return d >= weekAgo;
}

function isThisMonth(date) {
  const now = new Date();
  const d = new Date(date);
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export default function FilterBar({ typeFilter, dateFilter, onTypeChange, onDateChange, language = 'es' }) {
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  const currentType = TYPE_OPTIONS(language).find(o => o.value === typeFilter) || TYPE_OPTIONS(language)[0];
  const currentDate = DATE_OPTIONS(language).find(o => o.value === dateFilter) || DATE_OPTIONS(language)[0];

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
      <span className="text-xs text-neutral-500 dark:text-white/40">{t('filters.title', language)}</span>

      {/* Tipo */}
      <div className="relative">
        <button
          onClick={() => { setShowTypeDropdown(!showTypeDropdown); setShowDateDropdown(false); }}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-neutral-300 dark:border-white/10 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        >
          <span>{currentType.icon}</span>
          <span>{currentType.label}</span>
          <svg className="w-3 h-3 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showTypeDropdown && (
          <div className="absolute top-full left-0 mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 rounded-md shadow-lg z-10 min-w-[120px]">
            {TYPE_OPTIONS(language).map(opt => (
              <button
                key={opt.value}
                onClick={() => { onTypeChange(opt.value); setShowTypeDropdown(false); }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors ${
                  opt.value === typeFilter ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300' : 'text-neutral-700 dark:text-white/80'
                }`}
              >
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fecha */}
      <div className="relative">
        <button
          onClick={() => { setShowDateDropdown(!showDateDropdown); setShowTypeDropdown(false); }}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-neutral-300 dark:border-white/10 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        >
          <span>📅</span>
          <span>{currentDate.label}</span>
          <svg className="w-3 h-3 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showDateDropdown && (
          <div className="absolute top-full left-0 mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 rounded-md shadow-lg z-10 min-w-[120px]">
            {DATE_OPTIONS(language).map(opt => (
              <button
                key={opt.value}
                onClick={() => { onDateChange(opt.value); setShowDateDropdown(false); }}
                className={`w-full px-3 py-1.5 text-xs text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors ${
                  opt.value === dateFilter ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300' : 'text-neutral-700 dark:text-white/80'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Cerrar dropdowns al hacer click fuera */}
      {(showTypeDropdown || showDateDropdown) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => { setShowTypeDropdown(false); setShowDateDropdown(false); }}
        />
      )}
    </div>
  );
}

export { isToday, isThisWeek, isThisMonth };
