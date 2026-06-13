interface Props {
  visible: boolean;
  progress: number;
}

export default function Loader({ visible, progress }: Props) {
  if (!visible) return null;

  return (
    <div id="loader" className="visible">
      <div className="label">Sincronizando Óptica...</div>
      <div className="bar">
        <i style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  );
}
