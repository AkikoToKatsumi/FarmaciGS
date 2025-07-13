"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethod = void 0;
// Enum para los métodos de pago
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "cash";
    PaymentMethod["CARD"] = "card";
    PaymentMethod["TRANSFER"] = "transfer";
    PaymentMethod["CREDIT"] = "credit"; // Crédito
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
