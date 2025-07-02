// Importa exec para ejecutar comandos de sistema y promisify para usar promesas
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import cron from 'node-cron';
import { AuditAction } from '../models';
import { notificationService } from './notification.service';
import { emailService } from './email.service';
import { createAuditLog } from './audit.service';
// Convierte exec a una función basada en promesas
const execAsync = promisify(exec);
// Servicio de respaldos de base de datos
class BackupService {
    constructor() {
        this.isRunning = false;
        // Inicializa la configuración desde variables de entorno o valores por defecto
        this.config = {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            database: process.env.DB_NAME || 'farmacia_db',
            username: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || '',
            backupDir: process.env.BACKUP_DIR || './backups',
            retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30')
        };
        this.ensureBackupDirectory();
        this.scheduleAutomaticBackups();
    }
    /**
     * Crear respaldo completo de la base de datos
     */
    async createBackup(userId) {
        if (this.isRunning) {
            throw new Error('Ya hay un proceso de respaldo en ejecución');
        }
        const startTime = Date.now();
        this.isRunning = true;
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `backup_${this.config.database}_${timestamp}.sql`;
            const filepath = path.join(this.config.backupDir, filename);
            // Comando pg_dump para crear el respaldo
            const command = `PGPASSWORD="${this.config.password}" pg_dump -h ${this.config.host} -p ${this.config.port} -U ${this.config.username} -d ${this.config.database} --verbose --clean --no-owner --no-privileges --format=plain --file="${filepath}"`;
            await execAsync(command);
            // Verificar que el archivo se creó correctamente
            const stats = await fs.promises.stat(filepath);
            const duration = Date.now() - startTime;
            // Registrar en auditoría
            if (userId) {
                await createAuditLog({
                    userId,
                    action: AuditAction.BACKUP_CREATE,
                    details: JSON.stringify({
                        filename,
                        size: stats.size,
                        duration
                    })
                });
            }
            // Notificar éxito
            await notificationService.create({
                type: 'info',
                title: 'Respaldo completado',
                message: `Respaldo creado exitosamente: ${filename}`,
                user_id: userId
            });
            // Limpiar respaldos antiguos
            await this.cleanOldBackups();
            return {
                success: true,
                filename,
                size: stats.size,
                duration
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            // Notificar error
            await notificationService.create({
                type: 'error',
                title: 'Error en respaldo',
                message: `Error al crear respaldo: ${errorMessage}`,
                user_id: userId
            });
            return {
                success: false,
                error: errorMessage
            };
        }
        finally {
            this.isRunning = false;
        }
    }
    /**
     * Restaurar base de datos desde un respaldo
     */
    async restoreBackup(options, userId) {
        const startTime = Date.now();
        const filepath = path.join(this.config.backupDir, options.filename);
        try {
            // Verificar que el archivo existe
            await fs.promises.access(filepath);
            // Comando psql para restaurar
            let command = `PGPASSWORD="${this.config.password}" psql -h ${this.config.host} -p ${this.config.port} -U ${this.config.username}`;
            if (options.dropExisting) {
                // Primero eliminar conexiones activas y recrear la base de datos
                const dropCommand = `PGPASSWORD="${this.config.password}" psql -h ${this.config.host} -p ${this.config.port} -U ${this.config.username} -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${this.config.database}'; DROP DATABASE IF EXISTS ${this.config.database}; CREATE DATABASE ${this.config.database};"`;
                await execAsync(dropCommand);
            }
            command += ` -d ${this.config.database} -f "${filepath}"`;
            await execAsync(command);
            const duration = Date.now() - startTime;
            // Registrar en auditoría
            if (userId) {
                await createAuditLog({
                    userId,
                    action: AuditAction.BACKUP_RESTORE,
                    details: JSON.stringify({
                        filename: options.filename,
                        duration,
                        dropExisting: options.dropExisting
                    })
                });
            }
            // Notificar éxito
            await notificationService.create({
                type: 'warning',
                title: 'Restauración completada',
                message: `Base de datos restaurada desde: ${options.filename}`,
                user_id: userId
            });
            return {
                success: true,
                filename: options.filename,
                duration
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            // Notificar error
            await notificationService.create({
                type: 'error',
                title: 'Error en restauración',
                message: `Error al restaurar: ${errorMessage}`,
                user_id: userId
            });
            return {
                success: false,
                error: errorMessage
            };
        }
    }
    /**
     * Listar respaldos disponibles
     */
    async listBackups() {
        try {
            const files = await fs.promises.readdir(this.config.backupDir);
            const backupFiles = files.filter(file => file.startsWith('backup_') && file.endsWith('.sql'));
            const backups = await Promise.all(backupFiles.map(async (filename) => {
                const filepath = path.join(this.config.backupDir, filename);
                const stats = await fs.promises.stat(filepath);
                return {
                    filename,
                    size: stats.size,
                    created: stats.birthtime,
                    age: this.getAgeString(stats.birthtime)
                };
            }));
            return backups.sort((a, b) => b.created.getTime() - a.created.getTime());
        }
        catch (error) {
            console.error('Error listing backups:', error);
            return [];
        }
    }
    /**
     * Eliminar un respaldo específico
     */
    async deleteBackup(filename, userId) {
        try {
            const filepath = path.join(this.config.backupDir, filename);
            await fs.promises.unlink(filepath);
            // Registrar en auditoría
            if (userId) {
                await createAuditLog({
                    userId,
                    action: 'backup_delete',
                    details: JSON.stringify({
                        filename
                    })
                });
            }
            return true;
        }
        catch (error) {
            console.error('Error deleting backup:', error);
            return false;
        }
    }
    /**
     * Programar respaldos automáticos
     */
    scheduleAutomaticBackups() {
        // Respaldo diario a las 2:00 AM
        cron.schedule('0 2 * * *', async () => {
            console.log('Iniciando respaldo automático...');
            await this.createBackup();
        });
        // Respaldo semanal los domingos a las 1:00 AM
        cron.schedule('0 1 * * 0', async () => {
            console.log('Iniciando respaldo semanal...');
            const result = await this.createBackup();
            if (result.success && result.filename) {
                // Enviar notificación por email del respaldo semanal
                await emailService.sendSystemNotification(process.env.ADMIN_EMAIL || 'admin@farmacia.com', 'Respaldo Semanal Completado', `El respaldo semanal se ha completado exitosamente.\nArchivo: ${result.filename}\nTamaño: ${this.formatFileSize(result.size || 0)}`);
            }
        });
    }
    /**
     * Limpiar respaldos antiguos
     */
    async cleanOldBackups() {
        try {
            const files = await fs.promises.readdir(this.config.backupDir);
            const backupFiles = files.filter(file => file.startsWith('backup_') && file.endsWith('.sql'));
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);
            for (const filename of backupFiles) {
                const filepath = path.join(this.config.backupDir, filename);
                const stats = await fs.promises.stat(filepath);
                if (stats.birthtime < cutoffDate) {
                    await fs.promises.unlink(filepath);
                    console.log(`Respaldo antiguo eliminado: ${filename}`);
                }
            }
        }
        catch (error) {
            console.error('Error cleaning old backups:', error);
        }
    }
    /**
     * Asegurar que el directorio de respaldos existe
     */
    ensureBackupDirectory() {
        if (!fs.existsSync(this.config.backupDir)) {
            fs.mkdirSync(this.config.backupDir, { recursive: true });
        }
    }
    /**
     * Obtener string de antigüedad de archivo
     */
    getAgeString(date) {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 0)
            return 'Hoy';
        if (diffDays === 1)
            return 'Ayer';
        if (diffDays < 7)
            return `${diffDays} días`;
        if (diffDays < 30)
            return `${Math.floor(diffDays / 7)} semanas`;
        return `${Math.floor(diffDays / 30)} meses`;
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
     * Verificar estado del servicio
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            // Aquí podrías agregar más información de estado
        };
    }
}
// Exporta una instancia del servicio de respaldos
export const backupService = new BackupService();
// Elimina este bloque duplicado al final del archivo:
// Agendar backup automático diario a las 2:00 AM
// cron.schedule('0 2 * * *', async () => {
//   try {
//     // Cambia el userId por el del sistema o admin (ejemplo: 1)
//     await createDatabaseBackup(1);
//     console.log('Backup automático realizado');
//   } catch (err) {
//     console.error('Error en backup automático:', err);
//   }
// });
