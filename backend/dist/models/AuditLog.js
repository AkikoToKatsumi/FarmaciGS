// Enum para las acciones posibles en la bitácora
export var AuditAction;
(function (AuditAction) {
    // Usuarios
    AuditAction["USER_LOGIN"] = "user_login";
    AuditAction["USER_LOGOUT"] = "user_logout";
    AuditAction["USER_CREATE"] = "user_create";
    AuditAction["USER_UPDATE"] = "user_update";
    AuditAction["USER_DELETE"] = "user_delete";
    // Medicamentos
    AuditAction["MEDICINE_CREATE"] = "medicine_create";
    AuditAction["MEDICINE_UPDATE"] = "medicine_update";
    AuditAction["MEDICINE_DELETE"] = "medicine_delete";
    AuditAction["MEDICINE_STOCK_UPDATE"] = "medicine_stock_update";
    // Ventas
    AuditAction["SALE_CREATE"] = "sale_create";
    AuditAction["SALE_CANCEL"] = "sale_cancel";
    // Clientes
    AuditAction["CLIENT_CREATE"] = "client_create";
    AuditAction["CLIENT_UPDATE"] = "client_update";
    AuditAction["CLIENT_DELETE"] = "client_delete";
    // Recetas
    AuditAction["PRESCRIPTION_CREATE"] = "prescription_create";
    AuditAction["PRESCRIPTION_UPDATE"] = "prescription_update";
    AuditAction["PRESCRIPTION_DELETE"] = "prescription_delete";
    // Proveedores
    AuditAction["PROVIDER_CREATE"] = "provider_create";
    AuditAction["PROVIDER_UPDATE"] = "provider_update";
    AuditAction["PROVIDER_DELETE"] = "provider_delete";
    // Sistema
    AuditAction["BACKUP_CREATE"] = "backup_create";
    AuditAction["BACKUP_RESTORE"] = "backup_restore";
    AuditAction["SYSTEM_CONFIG_UPDATE"] = "system_config_update";
})(AuditAction || (AuditAction = {}));
