"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refresh = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const register = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Create user
        const user = await prisma.user.create({
            data: { email, password: hashedPassword },
            select: { id: true, email: true, createdAt: true }
        });
        // Generate tokens
        const tokens = generateTokens(user);
        res.status(201).json({ message: 'User created successfully', ...tokens });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        // Find user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Check password
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Generate tokens
        const tokens = generateTokens(user);
        res.json({ message: 'Login successful', ...tokens });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token required' });
        }
        // Verify refresh token
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        // Find user
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true }
        });
        if (!user) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }
        // Generate new tokens
        const tokens = generateTokens(user);
        res.json(tokens);
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({ message: 'Refresh token expired' });
        }
        next(error);
    }
};
exports.refresh = refresh;
const logout = (req, res) => {
    // In a real app, you might want to blacklist the token
    // For now, just send success response
    res.json({ message: 'Logged out successfully' });
};
exports.logout = logout;
function generateTokens(user) {
    const accessToken = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' } // Short-lived
    );
    const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' } // Long-lived
    );
    return {
        accessToken,
        refreshToken,
        user: { id: user.id, email: user.email }
    };
}
