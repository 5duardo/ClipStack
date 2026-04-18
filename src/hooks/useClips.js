import { useEffect, useState, useCallback } from 'react';

export default function useClips() {
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!window.clipstack) return;
    const data = await window.clipstack.getClips();
    setClips(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    if (!window.clipstack) return;
    const unsub = window.clipstack.onUpdated(() => {
      refresh();
    });
    return () => unsub && unsub();
  }, [refresh]);

  const copyClip = useCallback((id) => window.clipstack.copyClip(id), []);
  const togglePin = useCallback(async (id) => {
    await window.clipstack.togglePin(id);
    refresh();
  }, [refresh]);
  const remove = useCallback(async (id) => {
    await window.clipstack.remove(id);
    refresh();
  }, [refresh]);
  const clearAll = useCallback(async () => {
    await window.clipstack.clearAll();
    refresh();
  }, [refresh]);

  return { clips, loading, refresh, copyClip, togglePin, remove, clearAll };
}
