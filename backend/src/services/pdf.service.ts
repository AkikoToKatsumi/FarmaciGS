// src/services/pdf.service.ts
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { Buffer } from 'buffer';

interface Sale {
  id: number;
  user_id: number;
  client_id: number | null;
  total: number;
  created_at: string;
}

interface SaleItem {
  medicine_id: number;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export const generateSalePDF = async (sale: Sale, items: SaleItem[]): Promise<Buffer> => {
  // Leer el logo desde una imagen local y convertirlo a base64
  const logoPath = path.join(__dirname, '../../imagenes/logo-farmacia.png');
  const logoBase64 = fs.existsSync(logoPath)
    ? fs.readFileSync(logoPath, 'base64')
    : '';

  // 1. Crear HTML dinámico
  const html = buildInvoiceHtml(sale, items, logoBase64);

  // 2. Usar Puppeteer para renderizarlo
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: 'domcontentloaded' });

  const pdfBuffer = await page.pdf({
    width: '80mm',
    height: 'auto',
    printBackground: true,
    margin: { top: '0.5cm', bottom: '0.5cm', left: '0.5cm', right: '0.5cm' }
  });

  await browser.close();
  return Buffer.from(pdfBuffer);
};

function buildInvoiceHtml(sale: Sale, items: SaleItem[], logoBase64: string) {
  const date = new Date(sale.created_at).toLocaleString('es-ES');

  const rows = items.map(item => {
    const unitPrice = Number(item.unit_price);
    const totalPrice = Number(item.total_price);
    return `
      <tr>
        <td>${item.name}</td>
        <td style="text-align:center;">${item.quantity}</td>
        <td style="text-align:right;">$${unitPrice.toFixed(2)}</td>
        <td style="text-align:right;">$${totalPrice.toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  const totalFormatted = Number(sale.total).toFixed(2);

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Factura Venta #${sale.id}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 10px; font-size: 12px; }
        h1 { text-align: center; font-size: 16px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { padding: 6px; border-bottom: 1px solid #ccc; }
        th { background-color: #f5f5f5; font-size: 12px; }
        tfoot td { font-weight: bold; }
        .footer { margin-top: 20px; font-size: 10px; color: #555; text-align: center; }
        .logo { text-align: center; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="logo">
        ${logoBase64 ? `<img src="data:image/png;base64,${logoBase64}" alt="Logo" style="height: 60px;" />` : ''}
      </div>

      <h1>Factura de Venta</h1>
      <p><strong>Venta ID:</strong> ${sale.id}</p>
      <p><strong>Fecha:</strong> ${date}</p>

      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cant.</th>
            <th>Precio</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="text-align:right;">Total:</td>
            <td style="text-align:right;">$${totalFormatted}</td>
          </tr>
        </tfoot>
      </table>

      <div class="footer">
        <p><strong>Farmacia GS</strong> - Gracias por su compra</p>
        <p><strong>Teléfono:</strong> 123-456-7890</p>
        <p><strong>Dirección:</strong> Calle Duarte #12, Ciudad</p>
        <p><strong>Horario:</strong> Lunes a Sábado, 9:00 - 18:00</p>
        <p><strong>Política de Devoluciones:</strong></p>
        <p><strong>Devoluciones:</strong> dentro de 24 horas con empaque intacto.</p>
        <p>No se aceptan devoluciones de productos abiertos o sin receta.</p>

      </div>
    </body>
    </html>
  `;
}
