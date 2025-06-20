import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

interface GeneratePDFOptions {
  html: string;         // HTML como string
  outputPath?: string;  // Ruta donde guardar el PDF
  format?: 'A4' | 'Letter';
}

export const generatePDF = async ({
  html,
  outputPath,
  format = 'A4'
}: GeneratePDFOptions): Promise<Buffer> => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Cargar HTML en blanco
  await page.setContent(html, {
    waitUntil: 'networkidle0'
  });

  // Generar PDF
  const pdfBuffer = await page.pdf({
    format,
    printBackground: true,
    path: outputPath // opcional
  });

  await browser.close();
  return Buffer.from(pdfBuffer);
};

// Uso opcional: guardar directamente como archivo
export const savePDFToFile = async (html: string, filename: string) => {
  const outputPath = path.join(__dirname, '../../docs/generated', filename);

  const buffer = await generatePDF({ html, outputPath });
  fs.writeFileSync(outputPath, buffer);
  return outputPath;
};
