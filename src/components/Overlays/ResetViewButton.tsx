import { useStore } from '../../store';

export default function ResetViewButton() {
  const clearSelection = useStore((s) => s.clearSelection);
  const showInfoPanel = useStore((s) => s.showInfoPanel);

  if (!showInfoPanel) return null;

  return (
    <button
      id="reset-view-bottom"
      className="visible reset-view-bottom"
      onClick={clearSelection}
    >
      Restablecer Vista
    </button>
  );
}
