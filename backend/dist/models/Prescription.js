"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionStatus = void 0;
// Enum para el estado de la receta
var PrescriptionStatus;
(function (PrescriptionStatus) {
    PrescriptionStatus["PENDING"] = "pending";
    PrescriptionStatus["FILLED"] = "filled";
    PrescriptionStatus["EXPIRED"] = "expired";
    PrescriptionStatus["CANCELLED"] = "cancelled"; // Cancelada
})(PrescriptionStatus || (exports.PrescriptionStatus = PrescriptionStatus = {}));
