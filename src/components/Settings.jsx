import React, { useState, useRef, useEffect } from 'react';
import { t } from '../i18n/translations.js';

function formatKeys(keys) {
  return keys
    .map((k) => {
      if (k === 'Control') return 'Ctrl';
      if (k === 'Meta') return process.platform === 'darwin' ? 'Cmd' : 'Win';
      return k;
    })
    .join('+');
}

function eventToAccelerator(e) {
  const mods = [];
  if (e.ctrlKey) mods.push('Control');
  if (e.shiftKey) mods.push('Shift');
  if (e.altKey) mods.push('Alt');
  if (e.metaKey) mods.push('Command');

  let key = e.key;
  if (key.length === 1) key = key.toUpperCase();
  // Ignorar si solo se presionaron modificadores
  if (['Control', 'Shift', 'Alt', 'Meta'].includes(key)) return null;
  if (mods.length === 0) return null;

  // Normalizar nombres
  const map = {
    ' ': 'Space',
    ArrowUp: 'Up',
    ArrowDown: 'Down',
    ArrowLeft: 'Left',
    ArrowRight: 'Right',
    Escape: 'Esc',
  };
  if (map[key]) key = map[key];

  return [...mods, key].join('+');
}

export default function Settings({ settings, onChange }) {
  const [capturing, setCapturing] = useState(false);
  const [hotkeyPreview, setHotkeyPreview] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [appVersion, setAppVersion] = useState('');
  const [updateStatus, setUpdateStatus] = useState(null); // 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'
  const [updateData, setUpdateData] = useState(null);
  const inputRef = useRef(null);

  // Asegurar que language siempre tenga un valor
  const language = settings?.language || 'es';

  const handleClearHistory = async () => {
    await window.clipstack?.clearAll();
    setShowClearConfirm(false);
  };

  useEffect(() => {
    document.title = t('settings.title', language) + ' - ClipStack';
    return () => { document.title = 'ClipStack'; };
  }, [language]);

  useEffect(() => {
    if (window.clipstack?.getAppVersion) {
      window.clipstack
        .getAppVersion()
        .then((v) => setAppVersion(v || '0.1.0'))
        .catch(() => setAppVersion('0.1.0'));
    } else {
      setAppVersion('0.1.0');
    }
  }, []);

  useEffect(() => {
    if (!window.clipstack?.onUpdateStatus) return;
    const unsub = window.clipstack.onUpdateStatus(({ status, data }) => {
      setUpdateStatus(status);
      setUpdateData(data);
    });
    return () => unsub && unsub();
  }, []);

  const handleCheckUpdates = () => {
    setUpdateStatus('checking');
    window.clipstack?.checkForUpdates?.();
  };

  useEffect(() => {
    if (!capturing) return;
    const handler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const acc = eventToAccelerator(e);
      if (acc) {
        setHotkeyPreview(acc);
      }
    };
    const keyup = (e) => {
      e.preventDefault();
      if (hotkeyPreview) {
        onChange({ hotkey: hotkeyPreview });
        setCapturing(false);
        setHotkeyPreview('');
      }
    };
    window.addEventListener('keydown', handler, true);
    window.addEventListener('keyup', keyup, true);
    return () => {
      window.removeEventListener('keydown', handler, true);
      window.removeEventListener('keyup', keyup, true);
    };
  }, [capturing, hotkeyPreview, onChange]);

  const startCapture = () => {
    setHotkeyPreview('');
    setCapturing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const resetHotkey = () => {
    const def = navigator.platform.includes('Mac') ? 'Command+Shift+V' : 'Control+Shift+V';
    onChange({ hotkey: def });
  };

  const handleOpenHypedCenter = (e) => {
    e.preventDefault();
    if (window.clipstack?.openExternal) {
      window.clipstack.openExternal('https://hyped.center');
      return;
    }
    window.open('https://hyped.center', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 text-neutral-800 dark:text-white/90">
      <section>
        <h2 className="text-sm uppercase tracking-wider text-neutral-500 dark:text-white/40 font-semibold mb-4">
          {t('settings.appearance', language)}
        </h2>
        <div className="space-y-4">
          {/* Tema */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-100 dark:bg-white/5">
            <div>
              <div className="text-sm font-medium">{t('settings.theme', language)}</div>
              <div className="text-xs text-neutral-500 dark:text-white/40 mt-1">
                {language === 'es' ? 'Elige entre tema claro y oscuro' : 'Choose between light and dark theme'}
              </div>
            </div>
            <div className="flex gap-1 p-1 rounded-lg bg-white dark:bg-neutral-800 shadow-sm">
              <button
                onClick={() => onChange({ theme: 'dark' })}
                className={`px-4 py-2 text-xs font-medium rounded-md transition-all ${
                  settings.theme === 'dark'
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 dark:text-white/60 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {t('settings.dark', language)}
              </button>
              <button
                onClick={() => onChange({ theme: 'light' })}
                className={`px-4 py-2 text-xs font-medium rounded-md transition-all ${
                  settings.theme === 'light'
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 dark:text-white/60 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {t('settings.light', language)}
              </button>
            </div>
          </div>

          {/* Idioma */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-100 dark:bg-white/5">
            <div>
              <div className="text-sm font-medium">{t('settings.language', language)}</div>
              <div className="text-xs text-neutral-500 dark:text-white/40 mt-1">
                {language === 'es' ? 'Selecciona el idioma de la interfaz' : 'Select interface language'}
              </div>
            </div>
            <div className="flex gap-1 p-1 rounded-lg bg-white dark:bg-neutral-800 shadow-sm">
              <button
                onClick={() => onChange({ language: 'es' })}
                className={`px-4 py-2 text-xs font-medium rounded-md transition-all ${
                  language === 'es'
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 dark:text-white/60 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Español
              </button>
              <button
                onClick={() => onChange({ language: 'en' })}
                className={`px-4 py-2 text-xs font-medium rounded-md transition-all ${
                  language === 'en'
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 dark:text-white/60 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm uppercase tracking-wider text-neutral-500 dark:text-white/40 font-semibold mb-4">
          {t('settings.system', language)}
        </h2>
        <div className="p-4 rounded-lg bg-neutral-100 dark:bg-white/5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium">{t('settings.launchOnStartup', language)}</div>
              <div className="text-xs text-neutral-500 dark:text-white/40 mt-1">
                {t('settings.launchOnStartup.description', language)}
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={!!settings.launchOnStartup}
              onClick={() => onChange({ launchOnStartup: !settings.launchOnStartup })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.launchOnStartup
                  ? 'bg-indigo-600'
                  : 'bg-neutral-300 dark:bg-white/20'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.launchOnStartup ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm uppercase tracking-wider text-neutral-500 dark:text-white/40 font-semibold mb-4">
          {t('settings.hotkey', language)}
        </h2>
        <div className="p-4 rounded-lg bg-neutral-100 dark:bg-white/5 space-y-4">
          <div>
            <div className="text-sm font-medium">{t('settings.hotkey', language)}</div>
            <div className="text-xs text-neutral-500 dark:text-white/40 mt-1">
              {t('settings.hotkey.description', language)}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={capturing ? hotkeyPreview : formatKeys((settings?.hotkey || 'Control+Alt+Z').split('+'))}
              readOnly
              placeholder="Ctrl+Shift+V"
              className={`flex-1 px-4 py-2.5 text-sm rounded-lg border ${
                capturing
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                  : 'border-neutral-300 dark:border-white/10 bg-white dark:bg-neutral-800'
              } text-neutral-900 dark:text-white font-mono`}
              onBlur={() => setTimeout(() => setCapturing(false), 200)}
            />
            <button
              onClick={startCapture}
              className="px-4 py-2.5 text-sm rounded-lg border border-neutral-300 dark:border-white/10 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            >
              {capturing ? 'Esc' : (language === 'es' ? 'Editar' : 'Edit')}
            </button>
            <button
              onClick={resetHotkey}
              className="px-4 py-2.5 text-sm rounded-lg border border-neutral-300 dark:border-white/10 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            >
              {t('settings.restore', language)}
            </button>
          </div>
          {capturing && (
            <div className="text-xs text-neutral-500 dark:text-white/40">
              {language === 'es' 
                ? 'Debe incluir al menos un modificador (Ctrl/Alt/Shift/Cmd) + una tecla'
                : 'Must include at least one modifier (Ctrl/Alt/Shift/Cmd) + a key'}
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-sm uppercase tracking-wider text-neutral-500 dark:text-white/40 font-semibold mb-4">
          {t('settings.data', language)}
        </h2>
        <div className="p-4 rounded-lg bg-neutral-100 dark:bg-white/5 space-y-4">
          <div>
            <div className="text-sm font-medium">{t('settings.clearHistory', language)}</div>
            <div className="text-xs text-neutral-500 dark:text-white/40 mt-1">
              {t('settings.clearHistory.description', language)}
            </div>
          </div>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-4 py-2.5 text-sm rounded-lg border border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
          >
            {t('settings.clearHistory', language)}
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-sm uppercase tracking-wider text-neutral-500 dark:text-white/40 font-semibold mb-4">
          {t('settings.about', language)}
        </h2>
        <div className="p-4 rounded-lg bg-neutral-100 dark:bg-white/5 text-xs text-neutral-600 dark:text-white/60 space-y-3">
          <div className="flex items-center justify-between">
            <span>{t('settings.version', language)}</span>
            <span className="font-mono font-medium text-neutral-800 dark:text-white/80">{appVersion || (language === 'es' ? 'Cargando...' : 'Loading...')}</span>
          </div>

          {/* Botón buscar actualizaciones */}
          <div className="pt-2 border-t border-neutral-200 dark:border-white/10">
            <button
              onClick={handleCheckUpdates}
              disabled={updateStatus === 'checking' || updateStatus === 'downloading'}
              className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                updateStatus === 'available' || updateStatus === 'downloaded'
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : updateStatus === 'error'
                  ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-500/30'
                  : 'bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-white/80 border border-neutral-300 dark:border-white/10'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {updateStatus === 'checking' && (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {language === 'es' ? 'Buscando...' : 'Checking...'}
                </>
              )}
              {updateStatus === 'downloading' && (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {language === 'es' ? `Descargando ${updateData?.percent || 0}%...` : `Downloading ${updateData?.percent || 0}%...`}
                </>
              )}
              {updateStatus === 'available' && (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {language === 'es' ? `v${updateData?.version} disponible - Descargando...` : `v${updateData?.version} available - Downloading...`}
                </>
              )}
              {updateStatus === 'downloaded' && (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {language === 'es' ? `v${updateData?.version} lista - Reinicia para instalar` : `v${updateData?.version} ready - Restart to install`}
                </>
              )}
              {updateStatus === 'not-available' && (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {language === 'es' ? 'Estás en la última versión' : 'You\'re up to date'}
                </>
              )}
              {updateStatus === 'error' && (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {language === 'es' ? 'Error al buscar actualización' : 'Error checking for updates'}
                </>
              )}
              {!updateStatus && (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {language === 'es' ? 'Buscar actualización' : 'Check for updates'}
                </>
              )}
            </button>
          </div>

          <div>{t('settings.description', language)}</div>
          <div className="pt-2 border-t border-neutral-200 dark:border-white/10">
            <div className="font-medium text-neutral-700 dark:text-white/80 flex items-center gap-2">
              {t('settings.createdBy', language)}{' '}
              <a
                href="https://hyped.center"
                onClick={handleOpenHypedCenter}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline transition-colors"
              >
                HYPED CENTER
              </a>
              <button
                onClick={handleOpenHypedCenter}
                className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-500 dark:text-white/50 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                title={language === 'es' ? 'Abrir enlace en navegador' : 'Open link in browser'}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H19m0 0v5.5M19 6l-7.5 7.5" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 8H7.75A1.75 1.75 0 006 9.75v6.5C6 17.216 6.784 18 7.75 18h6.5A1.75 1.75 0 0016 16.25V14" />
                </svg>
              </button>
            </div>
          </div>
          <div>{t('settings.license', language)}</div>
        </div>
      </section>

      {/* Modal de confirmación */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60">
          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl p-8 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
              {t('settings.clearHistory.confirm', language)}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-white/60 mb-8 leading-relaxed">
              {t('settings.clearHistory.confirmText', language)}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-5 py-2.5 text-sm rounded-lg border border-neutral-300 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-700 dark:text-white/80 transition-colors"
              >
                {t('settings.cancel', language)}
              </button>
              <button
                onClick={handleClearHistory}
                className="px-5 py-2.5 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
              >
                {t('settings.clear', language)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
