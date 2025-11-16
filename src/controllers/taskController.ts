import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user: { id: string; email: string };
}

interface TaskQuery {
  page?: string;
  limit?: string;
  status?: 'completed' | 'pending';
  search?: string;
}

export const getTasks = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '10', status, search }: TaskQuery = req.query;
    const userId = req.user.id;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { userId };

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
  } catch (error) {
    next(error);
  }
};

export const getTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;
    const userId = req.user.id;

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
  } catch (error) {
    next(error);
  }
};

export const toggleTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

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
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

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
  } catch (error) {
    next(error);
  }
};
