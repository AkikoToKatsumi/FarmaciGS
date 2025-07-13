"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.savePDFToFile = exports.generatePDF = void 0;
// Importa puppeteer para generar PDFs a partir de HTML
const puppeteer_1 = __importDefault(require("puppeteer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Función para generar un PDF a partir de HTML
const generatePDF = async ({ html, outputPath, format = 'A4' }) => {
    // Lanza un navegador headless (sin interfaz gráfica)
    const browser = await puppeteer_1.default.launch({ headless: true });
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
exports.generatePDF = generatePDF;
// Uso opcional: guardar directamente el PDF como archivo
const savePDFToFile = async (html, filename) => {
    // Define la ruta de salida
    const outputPath = path_1.default.join(__dirname, '../../docs/generated', filename);
    // Genera el PDF y lo guarda en disco
    const buffer = await (0, exports.generatePDF)({ html, outputPath });
    fs_1.default.writeFileSync(outputPath, buffer);
    return outputPath;
};
exports.savePDFToFile = savePDFToFile;
