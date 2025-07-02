// Importa puppeteer para generar PDFs a partir de HTML
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
// Función para generar un PDF a partir de HTML
export const generatePDF = async ({ html, outputPath, format = 'A4' }) => {
    // Lanza un navegador headless (sin interfaz gráfica)
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    // Cargar el HTML en blanco y esperar a que termine de cargar
    await page.setContent(html, {
        waitUntil: 'networkidle0'
    });
    // Generar el PDF con las opciones indicadas
    const pdfBuffer = await page.pdf({
        format,
        printBackground: true,
        path: outputPath // Si se indica, guarda el archivo en disco
    });
    // Cierra el navegador
    await browser.close();
    // Devuelve el PDF como buffer
    return Buffer.from(pdfBuffer);
};
// Uso opcional: guardar directamente el PDF como archivo
export const savePDFToFile = async (html, filename) => {
    // Define la ruta de salida
    const outputPath = path.join(__dirname, '../../docs/generated', filename);
    // Genera el PDF y lo guarda en disco
    const buffer = await generatePDF({ html, outputPath });
    fs.writeFileSync(outputPath, buffer);
    return outputPath;
};
