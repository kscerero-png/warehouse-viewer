import { useStore } from '../../store';

export default function ResetViewButton() {
  const resetAll = useStore((s) => s.resetAll);

  return (
    <button
      id="reset-view-bottom"
      className="visible reset-view-bottom"
      onClick={resetAll}
    >
      Restablecer Vista
    </button>
  );
}
