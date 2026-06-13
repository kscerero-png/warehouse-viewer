import SearchInput from './SearchInput';
import PasilloButtons from './PasilloButtons';
import { useStore } from '../../store';

export default function Sidebar() {
  const pasilloSeleccionado = useStore((s) => s.pasilloSeleccionado);
  const setPasillo = useStore((s) => s.setPasillo);
  const setSearchQuery = useStore((s) => s.setSearchQuery);

  return (
    <aside
      style={{
        width: 260,
        background: '#1e1e2e',
        borderRight: '1px solid #333',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '16px 16px 0', fontSize: 18, fontWeight: 700, color: '#e0e0e0' }}>
        Bodega 3D
      </div>
      <SearchInput onSearch={setSearchQuery} />
      <PasilloButtons selected={pasilloSeleccionado} onSelect={setPasillo} />
    </aside>
  );
}
