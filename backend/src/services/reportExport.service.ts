import * as fs from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';
import * as XLSX from 'xlsx';

/**
 * Exporta un reporte a PDF.
 * @param data Array de arrays de datos (filas).
 * @param headers Array de strings (cabeceras).
 * @param filename Nombre del archivo PDF a generar.
 * @returns Ruta absoluta del archivo generado.
 */
export function exportReportToPDF(data: any[][], headers: string[], filename: string): string {
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
  const exportDir = path.join(__dirname, '../../exports');
  if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir, { recursive: true });
  const filePath = path.join(exportDir, filename);

  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(16).text('Reporte', { align: 'center' });
  doc.moveDown();

  // Table headers
  doc.fontSize(12).font('Helvetica-Bold');
  headers.forEach((header, i) => {
    doc.text(header, { continued: i < headers.length - 1, width: 120 });
  });
  doc.moveDown(0.5);

  // Table rows
  doc.font('Helvetica');
  data.forEach(row => {
    row.forEach((cell: any, i: number) => {
      doc.text(String(cell), { continued: i < row.length - 1, width: 120 });
    });
    doc.moveDown(0.5);
  });

  doc.end();
  return filePath;
}

/**
 * Exporta un reporte a Excel.
 * @param data Array de arrays de datos (filas).
 * @param headers Array de strings (cabeceras).
 * @param filename Nombre del archivo Excel a generar.
 * @returns Ruta absoluta del archivo generado.
 */
export function exportReportToExcel(data: any[][], headers: string[], filename: string): string {
    const exportDir = path.resolve(__dirname, '../../exports');
  if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir, { recursive: true });

  const wsData = [headers, ...data];

    // Check what is being passed to the excel library
    console.log('Excel data:', JSON.stringify(wsData));

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Reporte');

  const filePath = path.join(exportDir, filename);
  XLSX.writeFile(wb, filePath);

  return filePath;
}
