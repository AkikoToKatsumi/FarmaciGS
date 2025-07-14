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
  // 1. Crear HTML dinámico
  const html = buildInvoiceHtml(sale, items);

  // 2. Usar Puppeteer para renderizarlo
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: 'domcontentloaded' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' },
  });

  await browser.close();
  return Buffer.from(pdfBuffer);
;
};

function buildInvoiceHtml(sale: Sale, items: SaleItem[]) {
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
      <td style="text-align:right;">$${Number(sale.total).toFixed(2)}</td>

    </tr>
  `;
}).join('');


  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Factura Venta #${sale.id}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 8px; border-bottom: 1px solid #ccc; }
        th { background-color: #f5f5f5; }
        tfoot td { font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>Factura de Venta</h1>
      <p><strong>Venta ID:</strong> ${sale.id}</p>
      <p><strong>Fecha:</strong> ${date}</p>

      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cant.</th>
            <th>Precio Unit.</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="text-align:right;">Total:</td>
        <td style="text-align:right;">$${Number(sale.total).toFixed(2)}</td>

          </tr>
        </tfoot>
      </table>
    </body>
    </html>
  `;
}
