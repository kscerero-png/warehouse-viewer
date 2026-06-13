import type { Pasillo } from '../../types';

interface Props {
  selected: Pasillo;
  onSelect: (p: Pasillo) => void;
}

const PASILLOS: { label: string; value: Pasillo }[] = [
  { label: 'Todos', value: 'todos' },
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
  { label: '6', value: '6' },
  { label: '7', value: '7' },
  { label: '8', value: '8' },
  { label: '9', value: '9' },
  { label: 'Transito', value: 'T' },
  { label: 'Formulación', value: 'A' },
  { label: 'Galpón Anexo', value: 'P' },
  { label: 'Jaula', value: 'S' },
];

export default function PasilloButtons({ selected, onSelect }: Props) {
  return (
    <div style={{ padding: '0 16px 12px' }}>
      <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
        Pasillos
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {PASILLOS.map((p) => (
          <button
            key={p.value}
            onClick={() => onSelect(p.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: 'none',
              background: selected === p.value ? '#5c6bc0' : '#333',
              color: selected === p.value ? '#fff' : '#aaa',
              fontSize: 12,
              cursor: 'pointer',
              fontWeight: selected === p.value ? 600 : 400,
              transition: 'all 0.15s',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
