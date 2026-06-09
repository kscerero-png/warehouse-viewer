function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const inventarioSheet = ss.getSheetByName('Inventario');
    const productosSheet = ss.getSheetByName('Productos');

    if (!inventarioSheet || !productosSheet) {
      throw new Error('No se encontraron las hojas requeridas');
    }

    SpreadsheetApp.flush();

    const inventarioData = inventarioSheet.getDataRange().getValues();
    const productosData = productosSheet.getDataRange().getValues();

    const headers = inventarioData.shift();
    const productosMap = {};

    for (let i = 1; i < productosData.length; i++) {
      const row = productosData[i];
      const codigo = String(row[0] || '').trim();
      const peso = parseFloat(row[1]) || 0;
      if (codigo) {
        productosMap[codigo] = peso;
      }
    }

    const result = inventarioData.map(function(row) {
      const codigo = String(row[0] || '').trim();
      const producto = String(row[1] || '').trim();
      const ubicacion = String(row[2] || '').trim();
      const lote = String(row[3] || '').trim();
      const edoLote = String(row[4] || '').trim().toUpperCase();
      const cantidadStr = String(row[5] || '0').trim().replace(/,/g, '');
      const cantidad = parseFloat(cantidadStr) || 0;
      const um = String(row[6] || '').trim();
      const paletas = parseInt(row[7]) || 0;

      let estado = 'liberado';
      if (edoLote === 'R') estado = 'retenido';
      else if (edoLote === 'X') estado = 'rechazado';

      const item = {
        Codigo: codigo,
        Producto: producto,
        Ubicacion: ubicacion,
        Lote: lote,
        'Edo Lote': edoLote,
        Cantidad: cantidadStr,
        UM: um,
        id: ubicacion,
        producto: producto,
        codigo: codigo,
        lote: lote,
        cantidad: cantidad,
        um: um,
        estado: estado,
        paletas: paletas
      };

      if (productosMap[codigo]) {
        item.pesoPaleta = productosMap[codigo];
        item.pesoTotal = cantidad * productosMap[codigo];
      }

      return item;
    });

    var json = JSON.stringify(result);
    var callback = e && e.parameter && e.parameter.callback;

    var output;
    if (callback) {
      output = ContentService.createTextOutput(callback + '(' + json + ');');
      output.setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      output = ContentService.createTextOutput(json);
      output.setMimeType(ContentService.MimeType.JSON);
    }
    return output;

  } catch (error) {
    var errorJson = JSON.stringify({ error: error.message });
    var callback = e && e.parameter && e.parameter.callback;
    var output;
    if (callback) {
      output = ContentService.createTextOutput(callback + '(' + errorJson + ');');
      output.setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      output = ContentService.createTextOutput(errorJson);
      output.setMimeType(ContentService.MimeType.JSON);
    }
    return output;
  }
}
