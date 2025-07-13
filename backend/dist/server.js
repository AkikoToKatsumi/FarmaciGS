"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const sales_routes_1 = __importDefault(require("./routes/sales.routes"));
const clients_routes_1 = __importDefault(require("./routes/clients.routes"));
const roles_routes_1 = __importDefault(require("./routes/roles.routes"));
const provider_routes_1 = __importDefault(require("./routes/provider.routes"));
const inventory_routes_1 = __importDefault(require("./routes/inventory.routes")); // Descomentar si tienes rutas de inventario
const prescription_routes_1 = __importDefault(require("./routes/prescription.routes")); // Descomentar si tienes rutas de
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
// recetas
const audit_routes_1 = __importDefault(require("./routes/audit.routes")); // Descomentar si tienes rutas de auditor
const users_routes_1 = __importDefault(require("./routes/users.routes")); // Descomentar si tienes rutas de usuarios
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/auth', auth_routes_1.default);
app.use('/api/sales', sales_routes_1.default);
app.use('/api/clients', clients_routes_1.default);
app.use('/api/roles', roles_routes_1.default);
app.use('/api/providers', provider_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
// Rutas adicionales
app.use('/api/inventory', inventory_routes_1.default); // Descomentar si tienes rutas de
// inventario
app.use('/api/prescriptions', prescription_routes_1.default); // Descomentar si tienes rutas
// de recetas 
app.use('/api/audit', audit_routes_1.default); // Descomentar si tienes rutas de auditoría
app.use('/api/users', users_routes_1.default); // Descomentar si tienes rutas de usuarios
// Error handling middleware
app.use((err, req, res, next) => {
    console.error("❌ Error:", err.message);
    res.status(err.status || 500).json({ message: err.message || "Error interno del servidor" });
});
const PORT = process.env.PORT || 4003;
app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
