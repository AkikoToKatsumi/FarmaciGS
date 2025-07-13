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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportType = exports.Status = void 0;
// Exporta todos los modelos para uso global en la aplicación
__exportStar(require("./AuditLog"), exports);
__exportStar(require("./Branch"), exports);
__exportStar(require("./Client"), exports);
__exportStar(require("./Medicine"), exports);
__exportStar(require("./Prescription"), exports);
__exportStar(require("./Provider"), exports);
__exportStar(require("./Role"), exports);
__exportStar(require("./Sale"), exports);
__exportStar(require("./user"), exports);
// Enums globales para estados y tipos de reporte
var Status;
(function (Status) {
    Status["ACTIVE"] = "active";
    Status["INACTIVE"] = "inactive";
    Status["PENDING"] = "pending";
    Status["CANCELLED"] = "cancelled"; // Cancelado
})(Status || (exports.Status = Status = {}));
var ReportType;
(function (ReportType) {
    ReportType["SALES"] = "sales";
    ReportType["INVENTORY"] = "inventory";
    ReportType["CLIENTS"] = "clients";
    ReportType["AUDIT"] = "audit";
    ReportType["FINANCIAL"] = "financial"; // Reporte financiero
})(ReportType || (exports.ReportType = ReportType = {}));
