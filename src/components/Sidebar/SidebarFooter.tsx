import { useRef, useCallback } from 'react';
import { useStore } from '../../store';
import { csvToObjects } from '../../utils/csvParser';
import { isRackId } from '../../utils/idHelpers';

export default function SidebarFooter() {
  const setInventario = useStore((s) => s.setInventario);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCsvImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const rows = csvToObjects(text);
        if (rows.length === 0) { alert('CSV sin registros legibles.'); return; }

        const headers = Object.keys(rows[0]);
        const lower = headers.map((h) => h.toLowerCase());

        function findPref(prefs: string[]): string {
          for (const p of prefs) {
            const idx = lower.indexOf(p);
            if (idx !== -1) return headers[idx];
          }
          return headers[0];
        }

        const idKey = findPref(['id', 'sku', 'codigo', 'code']);
        const prodKey = findPref(['producto', 'product', 'nombre', 'name']);
        const codKey = findPref(['codigo', 'code', 'sku', 'barcode']);
        const loteKey = findPref(['lote', 'batch', 'lot']);
        const cantKey = findPref(['cantidad', 'quantity', 'qty', 'amount', 'stock']);
        const umKey = findPref(['um', 'unidad', 'unidad de medida', 'uom', 'unit']);
        const estadoKey = findPref(['estado', 'lote_estado', 'status', 'state', 'condicion']);

        const mapped = rows.map((r) => {
          let cant = parseFloat(r[cantKey]);
          if (Number.isNaN(cant)) cant = 0;
          const rawEstado = r[estadoKey] !== undefined ? String(r[estadoKey]).trim().toUpperCase() : '';
          return {
            id: r[idKey] || '',
            producto: r[prodKey] || '',
            codigo: r[codKey] !== undefined ? r[codKey] : '',
            lote: r[loteKey] !== undefined ? r[loteKey] : '',
            cantidad: cant,
            um: r[umKey] !== undefined ? r[umKey] : '',
            estado: rawEstado === 'R' ? 'retenido' as const : rawEstado === 'X' ? 'rechazado' as const : 'liberado' as const,
          };
        }).filter((r) => r.id && isRackId(r.id));

        setInventario(mapped);

        // Download JSON
        const blob = new Blob([JSON.stringify(mapped, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'inventario.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Error procesando CSV:', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [setInventario]);

  const handleResetView = useCallback(() => {
    useStore.getState().clearSelection();
  }, []);

  return (
    <div className="sidebar-footer">
      <div className="sidebar-actions">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          id="csv-input"
          style={{ display: 'none' }}
          onChange={handleCsvImport}
        />
        <button className="nav-btn" onClick={() => fileInputRef.current?.click()}>
          Importar CSV
        </button>
        <button className="nav-btn" onClick={handleResetView}>
          Reset Vista
        </button>
      </div>
    </div>
  );
}
