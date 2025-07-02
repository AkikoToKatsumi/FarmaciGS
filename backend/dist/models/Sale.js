// Enum para los métodos de pago
export var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "cash";
    PaymentMethod["CARD"] = "card";
    PaymentMethod["TRANSFER"] = "transfer";
    PaymentMethod["CREDIT"] = "credit"; // Crédito
})(PaymentMethod || (PaymentMethod = {}));
