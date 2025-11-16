import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string };
}

export const register = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
      select: { id: true, email: true, createdAt: true }
    });

    const tokens = generateTokens(user);

    res.status(201).json({ message: 'User created successfully', ...tokens });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const tokens = generateTokens(user);

    res.json({ message: 'Login successful', ...tokens });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const tokens = generateTokens(user);

    res.json(tokens);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Refresh token expired' });
    }
    next(error);
  }
};

export const logout = (req: Request, res: Response) => {
  res.json({ message: 'Logged out successfully' });
};

function generateTokens(user: Pick<User, 'id' | 'email'>): TokenResponse {
  const accessToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  );

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email }
  };
}
