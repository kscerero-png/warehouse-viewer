import { useMemo } from 'react';
import { useStore } from '../../store';

function compactNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export default function ZoneProductSummary() {
  const datosInventario = useStore((s) => s.datosInventario);
  const pasilloSeleccionado = useStore((s) => s.pasilloSeleccionado);

  const products = useMemo(() => {
    const zoneFilter = (id: string) => {
      if (pasilloSeleccionado === 'T') return /^T\d{2}$/.test(id);
      if (pasilloSeleccionado === 'A') return /^A\d{3}$/.test(id);
      if (pasilloSeleccionado === 'P') return /^P\d{2}$/.test(id);
      if (pasilloSeleccionado === 'S') return /^SQ\d{2}$/.test(id);
      return id[0] === pasilloSeleccionado;
    };

    const zoneData = datosInventario.filter((e) => zoneFilter(e.id));
    const useQty = /^[1-9A]$/.test(pasilloSeleccionado);

    const map = new Map<string, { producto: string; paletas: number; cantidad: number; ubicaciones: Set<string>; um: string; retenido: number; rechazado: number; liberado: number }>();

    zoneData.forEach((e) => {
      const key = e.producto || 'Sin nombre';
      if (!map.has(key)) map.set(key, { producto: key, paletas: 0, cantidad: 0, ubicaciones: new Set(), um: e.um || '', retenido: 0, rechazado: 0, liberado: 0 });
      const p = map.get(key)!;
      p.paletas += e.paletas || 0;
      p.cantidad += e.cantidad || 0;
      if (e.um) p.um = e.um;
      const rackId = e.id.replace(/-.*$/, '');
      if (rackId) p.ubicaciones.add(rackId);
      if (e.estado === 'retenido') p.retenido++;
      else if (e.estado === 'rechazado') p.rechazado++;
      else p.liberado++;
    });

    const items = Array.from(map.values());
    return items
      .sort((a, b) => {
        if (useQty) return b.cantidad - a.cantidad || b.paletas - a.paletas;
        return b.paletas - a.paletas || b.cantidad - a.cantidad;
      })
      .slice(0, 50);
  }, [datosInventario, pasilloSeleccionado]);

  if (!products || products.length === 0 || pasilloSeleccionado === 'todos') return null;

  const useQty = /^[1-9A]$/.test(pasilloSeleccionado);

  return (
    <div className="md-card zone-product-summary" id="zone-product-summary">
      <div className="card-title">Productos en Zona {pasilloSeleccionado}</div>
      <div className="summary-body">
        {products.map((p, i) => (
          <div key={i} className="summary-item">
            <span className="summary-item-name" title={p.producto}>{p.producto}</span>
            <span className="zp-summary-ubics">{p.ubicaciones.size} u.</span>
            <span className="zp-summary-qty">
              {useQty ? `${compactNum(p.cantidad)} ${p.um}` : p.paletas.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
