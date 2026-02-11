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
  // Log do erro de forma segura
  if (error.name === 'ZodError') {
    console.error('Validation Error:', (error as any).errors);
  } else {
    console.error('Error:', error.message, error.name);
  }

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
    const zodError = error as any;
    return res.status(400).json({
      status: 'error',
      message: 'Dados inválidos. Verifique os campos e tente novamente.',
      errors: zodError.errors?.map((e: any) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  return res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor',
  });
}
