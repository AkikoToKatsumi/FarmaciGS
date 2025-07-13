"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
// Importa nodemailer para el envío de correos electrónicos
const nodemailer = __importStar(require("nodemailer"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
// Servicio de email
class EmailService {
    constructor() {
        this.templatesPath = path.join(__dirname, '../templates/email');
        this.initializeTransporter();
    }
    /**
     * Inicializar el transportador de email
     */
    initializeTransporter() {
        const config = {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER || '',
                pass: process.env.SMTP_PASS || ''
            }
        };
        this.transporter = nodemailer.createTransport(config); // Crea el transportador
    }
    /**
     * Enviar email genérico
     */
    async sendEmail(options) {
        try {
            const mailOptions = {
                from: `${process.env.SMTP_FROM_NAME || 'Sistema Farmacia'} <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
                to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
                attachments: options.attachments,
                cc: options.cc?.join(', '),
                bcc: options.bcc?.join(', ')
            };
            await this.transporter.sendMail(mailOptions);
            console.log(`Email enviado exitosamente a: ${options.to}`);
            return true;
        }
        catch (error) {
            console.error('Error enviando email:', error);
            return false;
        }
    }
    /**
     * Enviar recibo de venta por email
     */
    async sendSaleReceipt(sale, clientEmail) {
        try {
            const template = await this.loadTemplate('sale-receipt', {
                saleId: sale.id,
                clientName: sale.client?.name || 'Cliente',
                saleDate: new Date(sale.created_at).toLocaleDateString('es-DO'),
                items: sale.items,
                total: sale.total,
                paymentMethod: this.translatePaymentMethod(sale.payment_method),
                companyName: process.env.COMPANY_NAME || 'Farmacia Sistema',
                companyAddress: process.env.COMPANY_ADDRESS || '',
                companyPhone: process.env.COMPANY_PHONE || ''
            });
            return await this.sendEmail({
                to: clientEmail,
                subject: `Recibo de Compra #${sale.id}`,
                html: template.html,
                text: template.text
            });
        }
        catch (error) {
            console.error('Error enviando recibo:', error);
            return false;
        }
    }
    /**
     * Enviar alerta de stock bajo
     */
    async sendLowStockAlert(medicine, adminEmails) {
        try {
            const template = await this.loadTemplate('low-stock-alert', {
                medicines: medicine.map(med => ({
                    name: med.name,
                    currentStock: med.stock,
                    minimumStock: 10 // Esto podría venir de configuración
                })),
                alertDate: new Date().toLocaleDateString('es-DO'),
                companyName: process.env.COMPANY_NAME || 'Farmacia Sistema'
            });
            return await this.sendEmail({
                to: adminEmails,
                subject: `🚨 Alerta: Medicamentos con Stock Bajo (${medicine.length})`,
                html: template.html,
                text: template.text
            });
        }
        catch (error) {
            console.error('Error enviando alerta de stock:', error);
            return false;
        }
    }
    /**
     * Enviar alerta de medicamentos próximos a vencer
     */
    async sendExpirationAlert(medicines, adminEmails) {
        try {
            const template = await this.loadTemplate('expiration-alert', {
                medicines: medicines.map(med => ({
                    name: med.name,
                    lotNumber: med.lot_number,
                    expirationDate: med.expiration_date ? new Date(med.expiration_date).toLocaleDateString('es-DO') : 'No especificada',
                    daysToExpiration: med.expiration_date ?
                        Math.ceil((new Date(med.expiration_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0,
                    stock: med.stock
                })),
                alertDate: new Date().toLocaleDateString('es-DO'),
                companyName: process.env.COMPANY_NAME || 'Farmacia Sistema'
            });
            return await this.sendEmail({
                to: adminEmails,
                subject: `⚠️ Alerta: Medicamentos Próximos a Vencer (${medicines.length})`,
                html: template.html,
                text: template.text
            });
        }
        catch (error) {
            console.error('Error enviando alerta de vencimiento:', error);
            return false;
        }
    }
    /**
     * Enviar notificación de respaldo completado
     */
    async sendBackupNotification(adminEmail, backupInfo) {
        try {
            const template = await this.loadTemplate('backup-notification', {
                filename: backupInfo.filename,
                size: this.formatFileSize(backupInfo.size),
                duration: `${Math.round(backupInfo.duration / 1000)} segundos`,
                backupDate: new Date().toLocaleString('es-DO'),
                companyName: process.env.COMPANY_NAME || 'Farmacia Sistema'
            });
            return await this.sendEmail({
                to: adminEmail,
                subject: '✅ Respaldo de Base de Datos Completado',
                html: template.html,
                text: template.text
            });
        }
        catch (error) {
            console.error('Error enviando notificación de respaldo:', error);
            return false;
        }
    }
    /**
     * Enviar reporte diario de ventas
     */
    async sendDailySalesReport(adminEmails, salesData, pdfBuffer) {
        try {
            const template = await this.loadTemplate('daily-sales-report', {
                reportDate: new Date().toLocaleDateString('es-DO'),
                totalSales: salesData.totalSales,
                totalRevenue: salesData.totalRevenue,
                topMedicines: salesData.topMedicines,
                companyName: process.env.COMPANY_NAME || 'Farmacia Sistema'
            });
            const attachments = [];
            if (pdfBuffer) {
                attachments.push({
                    filename: `reporte-ventas-${new Date().toISOString().split('T')[0]}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                });
            }
            return await this.sendEmail({
                to: adminEmails,
                subject: `📊 Reporte Diario de Ventas - ${new Date().toLocaleDateString('es-DO')}`,
                html: template.html,
                text: template.text,
                attachments
            });
        }
        catch (error) {
            console.error('Error enviando reporte diario:', error);
            return false;
        }
    }
    /**
     * Enviar notificación de bienvenida a nuevo usuario
     */
    async sendWelcomeEmail(userEmail, userName, temporaryPassword) {
        try {
            const template = await this.loadTemplate('welcome-user', {
                userName,
                userEmail,
                temporaryPassword,
                loginUrl: process.env.APP_URL || 'http://localhost:3000',
                companyName: process.env.COMPANY_NAME || 'Farmacia Sistema'
            });
            return await this.sendEmail({
                to: userEmail,
                subject: '👋 Bienvenido al Sistema de Farmacia',
                html: template.html,
                text: template.text
            });
        }
        catch (error) {
            console.error('Error enviando email de bienvenida:', error);
            return false;
        }
    }
    /**
     * Enviar notificación del sistema
     */
    async sendSystemNotification(adminEmail, title, message) {
        try {
            const template = await this.loadTemplate('system-notification', {
                title,
                message,
                timestamp: new Date().toLocaleString('es-DO'),
                companyName: process.env.COMPANY_NAME || 'Farmacia Sistema'
            });
            return await this.sendEmail({
                to: adminEmail,
                subject: `🔔 ${title}`,
                html: template.html,
                text: template.text
            });
        }
        catch (error) {
            console.error('Error enviando notificación del sistema:', error);
            return false;
        }
    }
    /**
     * Cargar template de email
     */
    async loadTemplate(templateName, data) {
        try {
            const htmlPath = path.join(this.templatesPath, `${templateName}.html`);
            const textPath = path.join(this.templatesPath, `${templateName}.txt`);
            let htmlContent = '';
            let textContent = '';
            // Cargar template HTML
            if (fs.existsSync(htmlPath)) {
                htmlContent = await fs.promises.readFile(htmlPath, 'utf-8');
                htmlContent = this.replaceTemplateVariables(htmlContent, data);
            }
            // Cargar template de texto
            if (fs.existsSync(textPath)) {
                textContent = await fs.promises.readFile(textPath, 'utf-8');
                textContent = this.replaceTemplateVariables(textContent, data);
            }
            // Si no hay template HTML, crear uno básico
            if (!htmlContent) {
                htmlContent = this.createBasicHtmlTemplate(templateName, data);
            }
            // Si no hay template de texto, crear uno básico
            if (!textContent) {
                textContent = this.createBasicTextTemplate(templateName, data);
            }
            return {
                subject: this.generateSubject(templateName, data),
                html: htmlContent,
                text: textContent
            };
        }
        catch (error) {
            console.error('Error cargando template:', error);
            throw error;
        }
    }
    /**
     * Reemplazar variables en templates
     */
    replaceTemplateVariables(content, data) {
        let result = content;
        // Reemplazar variables simples {{variable}}
        result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return data[key] || match;
        });
        // Reemplazar loops {{#each items}}...{{/each}}
        result = result.replace(/\{\{#each (\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrayName, template) => {
            const array = data[arrayName];
            if (!Array.isArray(array))
                return '';
            return array.map(item => {
                return this.replaceTemplateVariables(template, item);
            }).join('');
        });
        return result;
    }
    /**
     * Crear template HTML básico
     */
    createBasicHtmlTemplate(templateName, data) {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${data.companyName || 'Farmacia Sistema'}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { background-color: #f3f4f6; padding: 10px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${data.companyName || 'Farmacia Sistema'}</h1>
        </div>
        <div class="content">
          <p>Estimado usuario,</p>
          <p>Este es un mensaje automático del sistema.</p>
          ${JSON.stringify(data, null, 2)}
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${data.companyName || 'Farmacia Sistema'}. Todos los derechos reservados.</p>
        </div>
      </body>
      </html>
    `;
    }
    /**
     * Crear template de texto básico
     */
    createBasicTextTemplate(templateName, data) {
        return `
${data.companyName || 'Farmacia Sistema'}
=====================================

Estimado usuario,

Este es un mensaje automático del sistema.

${JSON.stringify(data, null, 2)}

© ${new Date().getFullYear()} ${data.companyName || 'Farmacia Sistema'}. Todos los derechos reservados.
    `;
    }
    /**
     * Generar asunto del email
     */
    generateSubject(templateName, data) {
        const subjects = {
            'sale-receipt': `Recibo de Compra #${data.saleId}`,
            'low-stock-alert': `🚨 Alerta: Stock Bajo`,
            'expiration-alert': `⚠️ Alerta: Medicamentos por Vencer`,
            'backup-notification': `✅ Respaldo Completado`,
            'daily-sales-report': `📊 Reporte Diario de Ventas`,
            'welcome-user': `👋 Bienvenido al Sistema`,
            'system-notification': `🔔 ${data.title}`
        };
        return subjects[templateName] || 'Notificación del Sistema';
    }
    /**
     * Traducir método de pago
     */
    translatePaymentMethod(method) {
        const translations = {
            'cash': 'Efectivo',
            'card': 'Tarjeta',
            'transfer': 'Transferencia',
            'credit': 'Crédito'
        };
        return translations[method || ''] || method || 'No especificado';
    }
    /**
     * Formatear tamaño de archivo
     */
    formatFileSize(bytes) {
        const sizes = ['B', 'KB', 'MB', 'GB'];
        if (bytes === 0)
            return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }
    /**
     * Verificar configuración del servicio
     */
    async verifyConnection() {
        try {
            await this.transporter.verify();
            return true;
        }
        catch (error) {
            console.error('Error verificando conexión SMTP:', error);
            return false;
        }
    }
}
// Exporta una instancia del servicio de email
exports.emailService = new EmailService();
