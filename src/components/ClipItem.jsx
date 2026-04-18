import React, { useEffect, useState } from 'react';
import { t } from '../i18n/translations.js';

function formatTime(iso) {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return 'ahora';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return d.toLocaleDateString();
  } catch {
    return '';
  }
}

function getClipUrl(clip) {
  if (!clip || clip.type !== 'text' || !clip.content) return null;
  const content = clip.content.trim();
  try {
    const parsed = new URL(content);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    return null;
  }
  return null;
}

export default function ClipItem({ clip, selected, onClick, onTogglePin, onRemove, language = 'es' }) {
  const [imgSrc, setImgSrc] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const clipUrl = getClipUrl(clip);

  const handleCopyFromModal = () => {
    if (window.clipstack) {
      window.clipstack.copyClip(clip.id);
    }
    setShowViewModal(false);
  };

  const handleOpenExternal = (e) => {
    e.stopPropagation();
    if (!clipUrl || !window.clipstack?.openExternal) return;
    window.clipstack.openExternal(clipUrl);
  };

  useEffect(() => {
    let cancelled = false;
    if (clip.type === 'image' && window.clipstack) {
      window.clipstack.getImageDataURL(clip.content).then((dataURL) => {
        if (!cancelled) setImgSrc(dataURL);
      });
    }
    return () => { cancelled = true; };
  }, [clip]);

  return (
    <div
      onClick={onClick}
      className={`group flex items-start gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
        selected
          ? 'bg-indigo-100 dark:bg-indigo-500/20'
          : 'hover:bg-neutral-100 dark:hover:bg-white/5'
      }`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {clip.type === 'image' ? (
          <div className="w-10 h-10 rounded bg-neutral-100 dark:bg-white/5 overflow-hidden flex items-center justify-center">
            {imgSrc ? (
              <img src={imgSrc} alt="clip" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-5 h-5 text-neutral-400 dark:text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.58-4.59a2 2 0 012.83 0L16 16m-2-2l1.59-1.59a2 2 0 012.83 0L20 14M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
              </svg>
            )}
          </div>
        ) : (
          <div className="w-10 h-10 rounded bg-neutral-100 dark:bg-white/5 flex items-center justify-center">
            <svg className="w-5 h-5 text-neutral-400 dark:text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h10" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm text-neutral-800 dark:text-white/90 truncate">
          {clip.type === 'image' ? t('clip.image', language) : clip.preview || clip.content}
        </div>
        <div className="text-xs text-neutral-400 dark:text-white/30 mt-0.5">{formatTime(clip.created_at)}</div>
      </div>

      <div className="flex items-center gap-1 opacity-100">
        {clipUrl && (
          <button
            onClick={handleOpenExternal}
            className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-400 dark:text-white/40 hover:text-indigo-500 dark:hover:text-indigo-400"
            title={language === 'es' ? 'Abrir enlace en navegador' : 'Open link in browser'}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H19m0 0v5.5M19 6l-7.5 7.5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 8H7.75A1.75 1.75 0 006 9.75v6.5C6 17.216 6.784 18 7.75 18h6.5A1.75 1.75 0 0016 16.25V14" />
            </svg>
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); setShowViewModal(true); }}
          className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-400 dark:text-white/40 hover:text-indigo-500 dark:hover:text-indigo-400"
          title={t('clip.view', language)}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
          className={`p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-white/10 ${clip.pinned ? 'text-yellow-500 dark:text-yellow-400' : 'text-neutral-400 dark:text-white/40'}`}
          title={clip.pinned ? t('clip.unpin', language) : t('clip.pin', language)}
        >
          <svg className="w-4 h-4" fill={clip.pinned ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-400 dark:text-white/40 hover:text-red-500 dark:hover:text-red-400"
          title={t('clip.delete', language)}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V4a2 2 0 012-2h4a2 2 0 012 2v3" />
          </svg>
        </button>
      </div>

      {clip.pinned && (
        <div className="absolute" />
      )}

      {/* Modal de vista completa */}
      {showViewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 p-6"
          onClick={(e) => { e.stopPropagation(); setShowViewModal(false); }}
        >
          <div
            className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl max-w-4xl max-h-[90vh] w-full flex flex-col overflow-hidden border border-neutral-200 dark:border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {clip.type === 'image' ? t('clip.image', language) : t('clip.text', language)}
                </div>
                <div className="text-xs text-neutral-500 dark:text-white/40">
                  {formatTime(clip.created_at)}
                </div>
                {clip.type === 'text' && clip.content && (
                  <div className="text-xs text-neutral-500 dark:text-white/40">
                    · {clip.content.length} {t('clip.characters', language)}
                  </div>
                )}
                {clipUrl && (
                  <button
                    onClick={handleOpenExternal}
                    className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-500 dark:text-white/60 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                    title={language === 'es' ? 'Abrir enlace en navegador' : 'Open link in browser'}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H19m0 0v5.5M19 6l-7.5 7.5" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 8H7.75A1.75 1.75 0 006 9.75v6.5C6 17.216 6.784 18 7.75 18h6.5A1.75 1.75 0 0016 16.25V14" />
                    </svg>
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-500 dark:text-white/60"
                title={t('clip.close', language)}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6 bg-neutral-50 dark:bg-black/30">
              {clip.type === 'image' ? (
                <div className="flex items-center justify-center">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt="clip preview"
                      className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                    />
                  ) : (
                    <div className="text-neutral-400 dark:text-white/40 text-sm">Loading...</div>
                  )}
                </div>
              ) : (
                <pre className="whitespace-pre-wrap break-words text-sm text-neutral-800 dark:text-white/90 font-mono bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-white/10">
                  {clip.content}
                </pre>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 dark:border-white/10">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-sm rounded-lg border border-neutral-300 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-700 dark:text-white/80 transition-colors"
              >
                {t('clip.close', language)}
              </button>
              <button
                onClick={handleCopyFromModal}
                className="px-4 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {t('clip.copyContent', language)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
