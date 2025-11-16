"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.toggleTask = exports.updateTask = exports.createTask = exports.getTask = exports.getTasks = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getTasks = async (req, res, next) => {
    try {
        const { page = '1', limit = '10', status, search } = req.query;
        const userId = req.user.id;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;
        // Build where clause
        const where = { userId };
        if (status) {
            where.completed = status === 'completed';
        }
        if (search) {
            where.OR = [
                { title: { contains: search } },
                { description: { contains: search } }
            ];
        }
        const [tasks, total] = await Promise.all([
            prisma.task.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.task.count({ where })
        ]);
        res.json({
            tasks,
            pagination: {
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum),
                limit: limitNum
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTasks = getTasks;
const getTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const task = await prisma.task.findFirst({
            where: { id, userId }
        });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json(task);
    }
    catch (error) {
        next(error);
    }
};
exports.getTask = getTask;
const createTask = async (req, res, next) => {
    try {
        const { title, description } = req.body;
        const userId = req.user.id;
        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }
        const task = await prisma.task.create({
            data: {
                title,
                description,
                userId
            }
        });
        res.status(201).json(task);
    }
    catch (error) {
        next(error);
    }
};
exports.createTask = createTask;
const updateTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, completed } = req.body;
        const userId = req.user.id;
        // Check if task exists and belongs to user
        const existingTask = await prisma.task.findFirst({
            where: { id, userId }
        });
        if (!existingTask) {
            return res.status(404).json({ message: 'Task not found' });
        }
        const task = await prisma.task.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(completed !== undefined && { completed })
            }
        });
        res.json(task);
    }
    catch (error) {
        next(error);
    }
};
exports.updateTask = updateTask;
// Special endpoint for toggling completion status
const toggleTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        // Check if task exists and belongs to user
        const existingTask = await prisma.task.findFirst({
            where: { id, userId }
        });
        if (!existingTask) {
            return res.status(404).json({ message: 'Task not found' });
        }
        const task = await prisma.task.update({
            where: { id },
            data: { completed: !existingTask.completed }
        });
        res.json(task);
    }
    catch (error) {
        next(error);
    }
};
exports.toggleTask = toggleTask;
const deleteTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        // Check if task exists and belongs to user
        const existingTask = await prisma.task.findFirst({
            where: { id, userId }
        });
        if (!existingTask) {
            return res.status(404).json({ message: 'Task not found' });
        }
        await prisma.task.delete({
            where: { id }
        });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deleteTask = deleteTask;
