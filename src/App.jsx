import React, { useEffect, useMemo, useRef, useState } from 'react';
import useClips from './hooks/useClips.js';
import SearchBar from './components/SearchBar.jsx';
import FilterBar from './components/FilterBar.jsx';
import ClipItem from './components/ClipItem.jsx';
import PinnedSection from './components/PinnedSection.jsx';
import TitleBar from './components/TitleBar.jsx';
import Settings from './components/Settings.jsx';
import { isToday, isThisWeek, isThisMonth } from './components/FilterBar.jsx';
import { t } from './i18n/translations.js';

export default function App() {
  const { clips, copyClip, togglePin, remove, clearAll } = useClips();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'text' | 'image'
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | 'week' | 'month'
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [view, setView] = useState('home'); // 'home' | 'settings'
  const [settings, setSettings] = useState({
    theme: 'dark',
    hotkey: 'Control+Alt+Z',
    language: 'es',
    launchOnStartup: false,
  });
  const searchRef = useRef(null);
  const listRef = useRef(null);

  // Cargar settings al inicio
  useEffect(() => {
    if (!window.clipstack) return;
    window.clipstack.getSettings().then((s) => s && setSettings(s));
    const unsub = window.clipstack.onSettingsUpdated((s) => s && setSettings(s));
    return () => unsub && unsub();
  }, []);

  // Aplicar tema al <html>
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [settings.theme]);

  const saveSettings = async (partial) => {
    const next = await window.clipstack.setSettings(partial);
    if (next) setSettings(next);
  };

  const filtered = useMemo(() => {
    let result = clips;

    // Filtro por tipo
    if (typeFilter !== 'all') {
      result = result.filter(c => c.type === typeFilter);
    }

    // Filtro por fecha
    if (dateFilter !== 'all') {
      result = result.filter(c => {
        const date = new Date(c.created_at);
        switch (dateFilter) {
          case 'today': return isToday(date);
          case 'week': return isThisWeek(date);
          case 'month': return isThisMonth(date);
          default: return true;
        }
      });
    }

    // Filtro por texto
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((c) => {
        if (c.type === 'text') return (c.content || '').toLowerCase().includes(q);
        return 'imagen'.includes(q);
      });
    }

    return result;
  }, [clips, query, typeFilter, dateFilter]);

  const pinned = filtered.filter((c) => c.pinned);
  const unpinned = filtered.filter((c) => !c.pinned);
  const flatList = [...pinned, ...unpinned];

  useEffect(() => {
    setSelectedIdx(0);
  }, [query, typeFilter, dateFilter, clips.length]);

  useEffect(() => {
    if (!window.clipstack) return;
    const unsub = window.clipstack.onShown(() => {
      setQuery('');
      setSelectedIdx(0);
      setTimeout(() => searchRef.current?.focus(), 50);
    });
    return () => unsub && unsub();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      window.clipstack?.hideWindow();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, flatList.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const clip = flatList[selectedIdx];
      if (clip) copyClip(clip.id);
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        handleKeyDown(e);
        return;
      }
      if (view !== 'home') return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        handleKeyDown(e);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  return (
    <div className="h-screen w-screen flex flex-col bg-white dark:bg-neutral-900 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-2xl">
      <TitleBar
        view={view}
        onOpenSettings={() => setView('settings')}
        onShowHome={() => setView('home')}
        language={settings.language}
      />

      {view === 'settings' ? (
        <Settings settings={settings} onChange={saveSettings} />
      ) : (
        <>
          <SearchBar
            ref={searchRef}
            value={query}
            onChange={setQuery}
            onKeyDown={handleKeyDown}
            language={settings.language}
          />

          <FilterBar
            typeFilter={typeFilter}
            dateFilter={dateFilter}
            onTypeChange={setTypeFilter}
            onDateChange={setDateFilter}
            language={settings.language}
          />

          <div ref={listRef} className="flex-1 overflow-y-auto relative">
            {flatList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-neutral-400 dark:text-white/30 text-sm gap-2">
                <svg className="w-12 h-12 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <div>
                  {query || typeFilter !== 'all' || dateFilter !== 'all'
                    ? t('app.noResultsWithFilters', settings.language)
                    : t('app.noClips', settings.language)}
                </div>
              </div>
            ) : (
              <>
                <PinnedSection
                  clips={pinned}
                  selectedId={flatList[selectedIdx]?.id}
                  onClick={copyClip}
                  onTogglePin={togglePin}
                  onRemove={remove}
                  language={settings.language}
                />
                {unpinned.map((c) => (
                  <ClipItem
                    key={c.id}
                    clip={c}
                    selected={flatList[selectedIdx]?.id === c.id}
                    onClick={() => copyClip(c.id)}
                    onTogglePin={() => togglePin(c.id)}
                    onRemove={() => remove(c.id)}
                    language={settings.language}
                  />
                ))}
              </>
            )}
          </div>

          <div className="flex items-center justify-center px-4 py-2 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-white/40 bg-neutral-50 dark:bg-neutral-950">
            <div className="flex items-center gap-3">
              <span><kbd className="text-neutral-700 dark:text-white/60">↑↓</kbd> {t('footer.navigate', settings.language)}</span>
              <span><kbd className="text-neutral-700 dark:text-white/60">⮐</kbd> {t('footer.copy', settings.language)}</span>
              <span><kbd className="text-neutral-700 dark:text-white/60">ESC</kbd> {t('footer.close', settings.language)}</span>
              <span className="text-neutral-400 dark:text-white/30">· {settings.hotkey}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
