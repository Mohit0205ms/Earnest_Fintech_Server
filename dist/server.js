"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = require("body-parser");
const auth_1 = __importDefault(require("./routes/auth"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use((0, body_parser_1.json)());
// Routes
app.use('/auth', auth_1.default);
app.use('/tasks', tasks_1.default);
// Error handling middleware
app.use(errorHandler_1.errorHandler);
// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Task Management API is running' });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;
