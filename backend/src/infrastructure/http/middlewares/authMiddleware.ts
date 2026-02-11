import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError('Token não fornecido', 401);
  }

  const [, token] = authHeader.split(' ');

  if (!token) {
    throw new AppError('Token não fornecido', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    return next();
  } catch {
    throw new AppError('Token inválido', 401);
  }
}

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    throw new AppError('Não autorizado', 401);
  }

  if (req.user.role !== 'ADMIN') {
    throw new AppError('Acesso negado. Apenas administradores.', 403);
  }

  return next();
}
