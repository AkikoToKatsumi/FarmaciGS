"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStatus = void 0;
// Enum para los estados de una orden de proveedor
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "pending";
    OrderStatus["CONFIRMED"] = "confirmed";
    OrderStatus["SHIPPED"] = "shipped";
    OrderStatus["DELIVERED"] = "delivered";
    OrderStatus["CANCELLED"] = "cancelled"; // Cancelada
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
