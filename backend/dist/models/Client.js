"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllClients = void 0;
const db_1 = __importDefault(require("../config/db"));
const getAllClients = async () => {
    const result = await db_1.default.query('SELECT * FROM clients');
    return result.rows;
};
exports.getAllClients = getAllClients;
