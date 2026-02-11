import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
    });
  }

  // Erro do Prisma
  if (error.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      status: 'error',
      message: 'Erro no banco de dados',
    });
  }

  // Erro de validação do Zod
  if (error.name === 'ZodError') {
    return res.status(400).json({
      status: 'error',
      message: 'Erro de validação',
      errors: error,
    });
  }

  return res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor',
  });
}
