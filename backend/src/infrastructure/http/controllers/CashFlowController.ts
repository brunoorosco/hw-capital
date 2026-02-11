import { Request, Response } from 'express';
import { PrismaClient } from '../../database/prisma/PrismaClient';
import { z } from 'zod';
import { AppError } from '../middlewares/errorHandler';

const prisma = PrismaClient.getInstance();

const createCashFlowSchema = z.object({
  clientId: z.string(),
  type: z.enum(['ENTRADA', 'SAIDA']),
  description: z.string(),
  amount: z.number().positive(),
  date: z.string(),
  category: z.string().optional(),
  document: z.string().optional(),
  observation: z.string().optional(),
});

export class CashFlowController {
  async list(req: Request, res: Response) {
    const { clientId, type, startDate, endDate } = req.query;

    const where: any = {};

    if (clientId) {
      where.clientId = clientId;
    }

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.date.lte = new Date(endDate as string);
      }
    }

    const movements = await prisma.cashFlowMovement.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return res.json(movements);
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;

    const movement = await prisma.cashFlowMovement.findUnique({
      where: { id },
      include: {
        client: true,
      },
    });

    if (!movement) {
      throw new AppError('Movimentação não encontrada', 404);
    }

    return res.json(movement);
  }

  async create(req: Request, res: Response) {
    const data = createCashFlowSchema.parse(req.body);

    const movement = await prisma.cashFlowMovement.create({
      data: {
        ...data,
        date: new Date(data.date),
        status: 'confirmed',
      },
      include: {
        client: true,
      },
    });

    return res.status(201).json(movement);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const data = req.body;

    const movement = await prisma.cashFlowMovement.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
      include: {
        client: true,
      },
    });

    return res.json(movement);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    await prisma.cashFlowMovement.delete({
      where: { id },
    });

    return res.status(204).send();
  }

  async summary(req: Request, res: Response) {
    const { clientId, startDate, endDate } = req.query;

    const where: any = {};

    if (clientId) {
      where.clientId = clientId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.date.lte = new Date(endDate as string);
      }
    }

    const movements = await prisma.cashFlowMovement.findMany({
      where,
    });

    const entradas = movements
      .filter(m => m.type === 'ENTRADA')
      .reduce((sum, m) => sum + Number(m.amount), 0);

    const saidas = movements
      .filter(m => m.type === 'SAIDA')
      .reduce((sum, m) => sum + Number(m.amount), 0);

    return res.json({
      entradas,
      saidas,
      saldo: entradas - saidas,
      totalMovimentos: movements.length,
    });
  }
}
