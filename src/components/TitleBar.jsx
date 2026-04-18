import React from 'react';
import { t } from '../i18n/translations.js';

export default function TitleBar({ onOpenSettings, onShowHome, view, language = 'es' }) {
  return (
    <div
      className="flex items-center justify-between h-9 px-3 border-b border-neutral-200 dark:border-white/10 bg-white/60 dark:bg-black/20"
      style={{ WebkitAppRegion: 'drag' }}
    >
      <div className="flex items-center gap-2 text-xs font-medium text-neutral-600 dark:text-white/60">
        <span>ClipStack</span>
        {view === 'settings' && <span className="text-neutral-400">/ {t('settings.title', language)}</span>}
      </div>

      <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' }}>
        {view === 'settings' ? (
          <button
            onClick={onShowHome}
            className="px-2 h-6 text-xs rounded hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-600 dark:text-white/60"
            title={t('search.back', language)}
          >
            ← {t('search.back', language)}
          </button>
        ) : (
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-500 dark:text-white/50"
            title={t('titlebar.settings', language)}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        )}

        <button
          onClick={() => window.clipstack?.minimizeWindow()}
          className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-500 dark:text-white/50"
          title={t('titlebar.minimize', language)}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d="M5 12h14" />
          </svg>
        </button>
      </div>
    </div>
  );
}
