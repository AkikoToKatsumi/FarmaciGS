// src/services/pdf.service.ts
import puppeteer from 'puppeteer';
import path, { extname } from 'path';
import fs from 'fs';
import { Buffer } from 'buffer';

interface Sale {
  id: number;
  user_id: number;
  client_id: number | null;
  total: number;
  created_at: string;
  // Nuevos campos para facturación RD
  rnc_cliente?: string;
  cedula_cliente?: string;
  nombre_cliente?: string;
  direccion_cliente?: string;
}

interface SaleItem {
  medicine_id: number;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

// Configuración de la empresa (deberías moverlo a un archivo de configuración)
const EMPRESA_CONFIG = {
  nombre: 'Farmacia GS',
  rnc: '#-01-12345-#', // RNC de la empresa
  direccion: 'Calle Duarte #12, Ciudad',
  telefono: '123-456-7890',
  email: 'info@farmaciags.com',
  // Nuevo: tasa ITBIS configurable
  itbis: process.env.ITBIS_RATE ? parseFloat(process.env.ITBIS_RATE) : 0.18
};

export const generateSalePDF = async (sale: Sale, items: SaleItem[]): Promise<Buffer> => {
  // Leer el logo desde una imagen local y convertirlo a base64
  const logoPath = path.join(__dirname,'desktop-app/public/imagenes/logo.gif');
 
 
  

  let logoBase64 = '';
  let mimeType = 'image/gif';

  try {
    if (fs.existsSync(logoPath)) {
      logoBase64 = fs.readFileSync(logoPath, 'base64');
      const ext = path.extname(logoPath).substring(1).toLowerCase();
      
      // Determinar el tipo MIME correcto
      switch (ext) {
        case 'gif':
          mimeType = 'image/gif';
          break;
        case 'png':
          mimeType = 'image/png';
          break;
        case 'jpg':
        case 'jpeg':
          mimeType = 'image/jpeg';
          break;
        case 'ico':
          mimeType = 'image/x-icon';
          break;
        default:
          mimeType = 'image/png';
      }
      
      console.log('Logo loaded successfully from:', logoPath);
      console.log('Logo file size:', fs.statSync(logoPath).size, 'bytes');
    } else {
      console.log('Logo file not found at:', logoPath);
      console.log('Current directory:', __dirname);
      console.log('Computed path:', logoPath);
    }
  } catch (error) {
    console.error('Error loading logo:', error);
  }

  // 1. Crear HTML dinámico
  const html = buildInvoiceHtml(sale, items, logoBase64, mimeType);
  
  // 2. Usar Puppeteer para renderizarlo
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: 'domcontentloaded' });

  // Solo esperar por el logo si existe
  if (logoBase64) {
    try {
      await page.waitForSelector('.logo img', { timeout: 5000 });
      console.log('Logo rendered successfully');
      
      // Verificar que la imagen se haya cargado correctamente
      const imageLoaded = await page.evaluate(() => {
        const img = document.querySelector('.logo img') as HTMLImageElement;
        return img && img.complete && img.naturalWidth > 0;
      });
      
      if (imageLoaded) {
        console.log('Logo image loaded and ready');
      } else {
        console.warn('Logo image failed to load properly');
      }
    } catch (error) {
      console.warn('Logo failed to render, continuing without it:', error instanceof Error ? error.message : String(error));
    }
  }

  // 3. Generar PDF
  // Ajustar el tamaño del PDF para que sea más compacto
  const pdfBuffer = await page.pdf({
    width: '80mm',
    printBackground: true,
    margin: { top: '0.5cm', bottom: '0.5cm', left: '0.5cm', right: '0.5cm' }
  });

  await browser.close();
  return Buffer.from(pdfBuffer);
};

function buildInvoiceHtml(sale: Sale, items: SaleItem[], logoBase64: string, mimeType: string) {
  const date = new Date(sale.created_at).toLocaleString('es-ES');
  
  // Cálculos para facturación RD
  // Usar la tasa ITBIS configurable
  const itbisRate = EMPRESA_CONFIG.itbis;
  const total = Number(sale.total);
  const subtotal = total / (1 + itbisRate);
  const itbis = total - subtotal;

  const rows = items.map(item => {
    const unitPrice = Number(item.unit_price);
    const totalPrice = Number(item.total_price);
    // Calcular precio sin ITBIS para cada item
    const unitPriceWithoutTax = unitPrice / (1 + itbisRate);
    const totalPriceWithoutTax = totalPrice / (1 + itbisRate);
    
    return `
      <tr>
        <td>${item.name}</td>
        <td style="text-align:center;">${item.quantity}</td>
        <td style="text-align:right;">$${unitPriceWithoutTax.toFixed(2)}</td>
        <td style="text-align:right;">$${totalPriceWithoutTax.toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  // Generar número de comprobante fiscal (NCF) 
  const ncf = `B0100000${String(sale.id).padStart(8, '0')}`;

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Factura Venta #${sale.id}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 8px; font-size: 11px; }
        h1 { text-align: center; font-size: 14px; margin: 5px 0; }
        .header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
        .company-info { text-align: center; margin-bottom: 10px; }
        .invoice-info { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .client-info { margin-bottom: 10px; border: 1px solid #ccc; padding: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { padding: 4px; border-bottom: 1px solid #ccc; font-size: 10px; }
        th { background-color: #f5f5f5; text-align: center; font-weight: bold; }
        .totals { margin-top: 10px; border-top: 2px solid #000; padding-top: 5px; }
        .totals table { margin-top: 5px; }
        .totals td { border: none; padding: 2px 5px; }
        .footer { margin-top: 15px; font-size: 9px; color: #555; text-align: center; }
        .logo { text-align: center; margin-bottom: 8px; }
        .logo img { height: 50px; width: auto; }
        .fiscal-info { font-size: 10px; text-align: center; margin: 5px 0; }
        .row-totals { display: flex; justify-content: space-between; }
        .bold { font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">
          ${logoBase64 ? `<img src="data:${mimeType};base64,${logoBase64}" alt="Logo" style="max-width: 100%; height: auto;" onload="console.log('Logo loaded successfully')" onerror="console.error('Logo failed to load in browser')" />` : '<h2>Farmacia GS</h2>'}
        </div>
        
        <div class="company-info">
          <div class="bold">${EMPRESA_CONFIG.nombre}</div>
          <div>RNC: ${EMPRESA_CONFIG.rnc}</div>
          <div>${EMPRESA_CONFIG.direccion}</div>
          <div>Tel: ${EMPRESA_CONFIG.telefono}</div>
          <div>${EMPRESA_CONFIG.email}</div>
        </div>
        
        <div class="fiscal-info">
          <div class="bold">FACTURA DE VENTA</div>
          <div>NCF: ${ncf}</div>
          <div>Válido hasta: ${new Date(new Date().getFullYear() + 1, 11, 31).toLocaleDateString('es-ES')}</div>
        </div>
      </div>

      <div class="invoice-info">
        <div>
          <div class="bold">Factura No: ${sale.id}</div>
          <div>Fecha: ${date}</div>
        </div>
        <div>
          <div>Página: 1 de 1</div>
        </div>
      </div>

      <div class="client-info">
        <div class="bold">DATOS DEL CLIENTE:</div>
        <div>Nombre: ${sale.nombre_cliente || 'Cliente General'}</div>
        <div>RNC/Cédula: ${sale.rnc_cliente || sale.cedula_cliente || 'N/A'}</div>
        <div>Dirección: ${sale.direccion_cliente || 'N/A'}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th>DESCRIPCIÓN</th>
            <th>CANT.</th>
            <th>PRECIO</th>
            <th>VALOR</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <div class="totals">
        <table style="width: 100%;">
          <tr>
            <td style="text-align: right; width: 70%;">SUBTOTAL:</td>
            <td style="text-align: right; width: 30%;">$${subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="text-align: right;">ITBIS (${(itbisRate * 100).toFixed(0)}%):</td>
            <td style="text-align: right;">$${itbis.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="text-align: right;">PROPINA:</td>
            <td style="text-align: right;">$0.00</td>
          </tr>
          <tr style="border-top: 1px solid #000; font-weight: bold;">
            <td style="text-align: right;">TOTAL A PAGAR:</td>
            <td style="text-align: right;">$${total.toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <div class="footer">
        <p><strong>POLÍTICA DE DEVOLUCIONES:</strong></p>
        <p>Las devoluciones se aceptan dentro de las 24 horas posteriores a la compra,</p>
        <p>con el empaque intacto y presentando esta factura.</p>
        <p>No se aceptan devoluciones de productos abiertos o medicamentos controlados.</p>
        <br>
        <p><strong>¡Gracias por su compra!</strong></p>
        <p>Horario: Lunes a Sábado, 9:00 AM - 6:00 PM</p>
      </div>
    </body>
    </html>
  `;
}