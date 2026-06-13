import { useState, useCallback, useRef, useEffect } from 'react';
import { useStore } from '../../store';
import { computeProductStats } from '../../utils/metrics';

export default function SearchInput() {
  const searchQuery = useStore((s) => s.searchQuery);
  const setSearchQuery = useStore((s) => s.setSearchQuery);
  const setProductStats = useStore((s) => s.setProductStats);
  const pasilloSeleccionado = useStore((s) => s.pasilloSeleccionado);
  const datosInventario = useStore((s) => s.datosInventario);
  const [suggestions, setSuggestions] = useState<{ id: string; producto: string; codigo: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateSuggestions = useCallback((term: string) => {
    if (!term.trim()) { setSuggestions([]); setShowSuggestions(false); return; }
    const t = term.toLowerCase().trim();
    const seen = new Set<string>();
    const results: { id: string; producto: string; codigo: string }[] = [];

    for (const item of datosInventario) {
      if (pasilloSeleccionado !== 'todos') {
        const primerDigito = item.id[0];
        if (pasilloSeleccionado === 'T' && !/^T\d{2}$/.test(item.id)) continue;
        else if (pasilloSeleccionado === 'A' && !/^A\d{3}$/.test(item.id)) continue;
        else if (pasilloSeleccionado === 'P' && !/^P\d{2}$/.test(item.id)) continue;
        else if (pasilloSeleccionado === 'S' && !/^SQ\d{2}$/.test(item.id)) continue;
        else if (/^\d+$/.test(pasilloSeleccionado) && primerDigito !== pasilloSeleccionado) continue;
      }

      const prod = (item.producto || '').toLowerCase();
      const cod = (item.codigo || '').toLowerCase();
      if (prod.includes(t) || cod.includes(t)) {
        const key = `${item.producto}|${item.codigo}`;
        if (!seen.has(key)) {
          seen.add(key);
          results.push({ id: item.id, producto: item.producto, codigo: item.codigo });
          if (results.length >= 20) break;
        }
      }
    }
    setSuggestions(results);
    setShowSuggestions(results.length > 0);
  }, [datosInventario, pasilloSeleccionado]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setSearchQuery(v);
    updateSuggestions(v);
  }, [setSearchQuery, updateSuggestions]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
    }
  }, []);

  const handleSelect = useCallback((value: string, codigo?: string) => {
    setSearchQuery(value);
    setShowSuggestions(false);
    const stats = computeProductStats(value, codigo, datosInventario);
    if (stats) setProductStats(stats);
  }, [setSearchQuery, datosInventario, setProductStats]);

  const handleClear = useCallback(() => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  }, [setSearchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="sidebar-search" ref={containerRef} style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: 4 }}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar producto o lote..."
          value={searchQuery}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#94a3b8',
              padding: '0 10px',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            ✕
          </button>
        )}
      </div>
      {showSuggestions && (
        <div id="search-suggestions" style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 200,
          background: '#1e293b',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 6,
          maxHeight: 240,
          overflowY: 'auto',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}>
          {suggestions.length === 0 ? (
            <div className="no-result">Sin resultados</div>
          ) : (
            suggestions.map((s, i) => (
              <button key={i} onClick={() => handleSelect(s.producto, s.codigo)}>
                <strong>{s.producto}</strong> {s.codigo && <span style={{color:'#64748b'}}>— {s.codigo}</span>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
