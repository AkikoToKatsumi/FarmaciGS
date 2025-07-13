"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importa express para crear la aplicación
const express_1 = __importDefault(require("express"));
// Importa cors para permitir peticiones de diferentes orígenes
const cors_1 = __importDefault(require("cors"));
// Importa dotenv para cargar variables de entorno desde .env
const dotenv_1 = __importDefault(require("dotenv"));
// Importa las rutas de autenticación
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
// Importa las rutas de inventario
const inventory_routes_1 = __importDefault(require("./routes/inventory.routes"));
// Importa las rutas de ventas
const sales_routes_1 = __importDefault(require("./routes/sales.routes"));
// Importa las rutas de clientes
const clients_routes_1 = __importDefault(require("./routes/clients.routes"));
// Importa las rutas de reportes
const reports_routes_1 = __importDefault(require("./routes/reports.routes"));
// Importa las rutas de roles
const roles_routes_1 = __importDefault(require("./routes/roles.routes"));
// Importa las rutas de proveedores
const provider_routes_1 = __importDefault(require("./routes/provider.routes"));
const prescription_routes_1 = __importDefault(require("./routes/prescription.routes"));
// Carga las variables de entorno
dotenv_1.default.config();
// Crea la instancia principal de la aplicación Express
const app = (0, express_1.default)();
// Habilita CORS para todas las rutas // Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Permite recibir y procesar JSON en las peticiones
app.use(express_1.default.json());
const PORT = process.env.PORT || 4002;
// Rutas principales de la API
app.use('/api/auth', auth_routes_1.default); // Rutas de autenticación
app.use('/api/inventory', inventory_routes_1.default); // Rutas de inventario
app.use('/api/sales', sales_routes_1.default); // Rutas de ventas
app.use('/api/clients', clients_routes_1.default); // Rutas de clientes
app.use('/api/reports', reports_routes_1.default); // Rutas de reportes
app.use('/api/roles', roles_routes_1.default); // Rutas de roles
app.use('/api/provider', provider_routes_1.default); // Rutas de proveedores
app.use('/api/prescriptions', prescription_routes_1.default);
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
// Exporta la app para ser utilizada en el archivo principal (server)
exports.default = app;
