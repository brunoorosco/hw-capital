import { Request, Response } from 'express';
import { PrismaClient } from '../../database/prisma/PrismaClient';
import { z } from 'zod';
import { AppError } from '../middlewares/errorHandler';
import { CashFlowCache } from '../../cache/CashFlowCache';

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
  private cache = CashFlowCache.getInstance();

  async list(req: Request, res: Response) {
    const { clientId, type, startDate, endDate } = req.query as Record<string, string | undefined>;

    const cacheKey = `list:${clientId || 'all'}:${type || 'all'}:${startDate || ''}:${endDate || ''}`;

    if (clientId) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }
    }

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

    if (clientId) {
      this.cache.set(cacheKey, movements);
    }

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

    this.cache.clear(data.clientId);

    return res.status(201).json(movement);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const data = req.body;

    const existing = await prisma.cashFlowMovement.findUnique({
      where: { id },
      select: { clientId: true },
    });

    if (existing) {
      this.cache.clear(existing.clientId);
    }

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

    if (data.clientId && data.clientId !== existing?.clientId) {
      this.cache.clear(data.clientId);
    }

    return res.json(movement);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    const movement = await prisma.cashFlowMovement.findUnique({
      where: { id },
      select: { clientId: true },
    });

    if (movement) {
      this.cache.clear(movement.clientId);
    }

    await prisma.cashFlowMovement.delete({
      where: { id },
    });

    return res.status(204).send();
  }

  async summary(req: Request, res: Response) {
    const { clientId, startDate, endDate } = req.query as Record<string, string | undefined>;

    const cacheKey = `summary:${clientId || 'all'}:${startDate || ''}:${endDate || ''}`;

    if (clientId) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }
    }

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

    const result = {
      entradas,
      saidas,
      saldo: entradas - saidas,
      totalMovimentos: movements.length,
    };

    if (clientId) {
      this.cache.set(cacheKey, result);
    }

    return res.json(result);
  }
}
