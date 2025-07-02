// Exporta todos los modelos para uso global en la aplicación
export * from './AuditLog';
export * from './Branch';
export * from './Client';
export * from './Medicine';
export * from './Prescription';
export * from './Provider';
export * from './Role';
export * from './Sale';
export * from './user';
// Enums globales para estados y tipos de reporte
export var Status;
(function (Status) {
    Status["ACTIVE"] = "active";
    Status["INACTIVE"] = "inactive";
    Status["PENDING"] = "pending";
    Status["CANCELLED"] = "cancelled"; // Cancelado
})(Status || (Status = {}));
export var ReportType;
(function (ReportType) {
    ReportType["SALES"] = "sales";
    ReportType["INVENTORY"] = "inventory";
    ReportType["CLIENTS"] = "clients";
    ReportType["AUDIT"] = "audit";
    ReportType["FINANCIAL"] = "financial"; // Reporte financiero
})(ReportType || (ReportType = {}));
