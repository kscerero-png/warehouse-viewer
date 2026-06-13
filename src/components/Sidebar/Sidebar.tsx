import SearchInput from './SearchInput';
import PasilloButtons from './PasilloButtons';
import SidebarFooter from './SidebarFooter';

export default function Sidebar() {
  return (
    <aside id="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">3D</div>
        <div>
          <div className="logo-text">Bodega 3D</div>
          <div className="logo-sub">Control de Operaciones</div>
        </div>
      </div>
      <SearchInput />
      <PasilloButtons />
      <SidebarFooter />
    </aside>
  );
}
