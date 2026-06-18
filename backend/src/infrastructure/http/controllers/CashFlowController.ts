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

  private async validateClientAccess(req: Request, clientId: string): Promise<void> {
    if (req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN') return;
    const client = await prisma.client.findFirst({
      where: { id: clientId, responsibleId: req.user!.id },
    });
    if (!client) {
      throw new AppError('Cliente não encontrado', 404);
    }
  }

  private async buildClientScope(req: Request): Promise<any> {
    if (req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN') return {};
    const clients = await prisma.client.findMany({
      where: { responsibleId: req.user!.id },
      select: { id: true },
    });
    const ids = clients.map(c => c.id);
    if (ids.length === 0) {
      return { id: '__NONE__' };
    }
    return { clientId: { in: ids } };
  }

  async list(req: Request, res: Response) {
    const { clientId, type, startDate, endDate } = req.query as Record<string, string | undefined>;

    if (clientId) {
      await this.validateClientAccess(req, clientId);
    }

    const cacheKey = `list:${clientId || 'all'}:${type || 'all'}:${startDate || ''}:${endDate || ''}`;

    if (clientId) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }
    }

    const userScope = await this.buildClientScope(req);
    const where: any = { ...userScope };

    if (clientId) {
      where.clientId = clientId;
    }

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
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

    const userScope = await this.buildClientScope(req);

    const movement = await prisma.cashFlowMovement.findFirst({
      where: { id, ...userScope },
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

    await this.validateClientAccess(req, data.clientId);

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

    if (data.clientId) {
      await this.validateClientAccess(req, data.clientId);
    }

    const userScope = await this.buildClientScope(req);

    const existing = await prisma.cashFlowMovement.findFirst({
      where: { id, ...userScope },
      select: { clientId: true },
    });

    if (!existing) {
      throw new AppError('Movimentação não encontrada', 404);
    }

    this.cache.clear(existing.clientId);

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

    if (data.clientId && data.clientId !== existing.clientId) {
      this.cache.clear(data.clientId);
    }

    return res.json(movement);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    const userScope = await this.buildClientScope(req);

    const movement = await prisma.cashFlowMovement.findFirst({
      where: { id, ...userScope },
      select: { clientId: true },
    });

    if (!movement) {
      throw new AppError('Movimentação não encontrada', 404);
    }

    this.cache.clear(movement.clientId);

    await prisma.cashFlowMovement.delete({
      where: { id },
    });

    return res.status(204).send();
  }

  async summary(req: Request, res: Response) {
    const { clientId, startDate, endDate } = req.query as Record<string, string | undefined>;

    if (clientId) {
      await this.validateClientAccess(req, clientId);
    }

    const cacheKey = `summary:${clientId || 'all'}:${startDate || ''}:${endDate || ''}`;

    if (clientId) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }
    }

    const userScope = await this.buildClientScope(req);
    const where: any = { ...userScope };

    if (clientId) {
      where.clientId = clientId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
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
