// Enum para el estado de la receta
export var PrescriptionStatus;
(function (PrescriptionStatus) {
    PrescriptionStatus["PENDING"] = "pending";
    PrescriptionStatus["FILLED"] = "filled";
    PrescriptionStatus["EXPIRED"] = "expired";
    PrescriptionStatus["CANCELLED"] = "cancelled"; // Cancelada
})(PrescriptionStatus || (PrescriptionStatus = {}));
