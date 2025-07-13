"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = void 0;
// Enum para los roles de usuario
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["PHARMACIST"] = "pharmacist";
    UserRole["CASHIER"] = "cashier";
    UserRole["EMPLOYEE"] = "employee"; // Empleado
})(UserRole || (exports.UserRole = UserRole = {}));
