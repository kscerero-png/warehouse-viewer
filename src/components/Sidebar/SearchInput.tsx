import { useState, useCallback } from 'react';

interface Props {
  onSearch: (query: string) => void;
}

export default function SearchInput({ onSearch }: Props) {
  const [query, setQuery] = useState('');

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setQuery(v);
      onSearch(v);
    },
    [onSearch]
  );

  return (
    <div style={{ padding: '12px 16px' }}>
      <input
        type="text"
        placeholder="Buscar producto o lote..."
        value={query}
        onChange={handleChange}
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: 8,
          border: '1px solid #444',
          background: '#2a2a3a',
          color: '#e0e0e0',
          fontSize: 13,
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}
