import { Request, Response } from 'express';
import { PrismaClient } from '../../database/prisma/PrismaClient';
import { z } from 'zod';
import { AppError } from '../middlewares/errorHandler';

const prisma = PrismaClient.getInstance();

const createReconciliationSchema = z.object({
  clientId: z.string(),
  bank: z.string(),
  account: z.string().optional(),
  period: z.string(),
  startBalance: z.number(),
  responsible: z.string().optional(),
  dueDate: z.string().optional(),
  observations: z.string().optional(),
});

export class ReconciliationController {
  private async userClientIds(req: Request): Promise<string[]> {
    if (req.user?.role === 'ADMIN') return [];
    const clients = await prisma.client.findMany({
      where: { responsibleId: req.user!.id },
      select: { id: true },
    });
    return clients.map(c => c.id);
  }

  private async userScope(req: Request): Promise<any> {
    if (req.user?.role === 'ADMIN') return {};
    const ids = await this.userClientIds(req);
    return { clientId: { in: ids } };
  }

  private async validateClientAccess(req: Request, clientId: string): Promise<void> {
    if (req.user?.role === 'ADMIN') return;
    const client = await prisma.client.findFirst({
      where: { id: clientId, responsibleId: req.user!.id },
    });
    if (!client) {
      throw new AppError('Cliente não encontrado', 404);
    }
  }

  async list(req: Request, res: Response) {
    const { clientId, status } = req.query;
    const scope = await this.userScope(req);

    const where: any = { ...scope };

    if (clientId) {
      where.clientId = clientId;
    }

    if (status) {
      where.status = status;
    }

    const reconciliations = await prisma.reconciliation.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            transactions: true,
            divergences: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json(reconciliations);
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;
    const scope = await this.userScope(req);

    const where: any = { id, ...scope };

    const reconciliation = await prisma.reconciliation.findFirst({
      where,
      include: {
        client: true,
        transactions: {
          orderBy: { date: 'desc' },
        },
        divergences: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!reconciliation) {
      throw new AppError('Reconciliação não encontrada', 404);
    }

    return res.json(reconciliation);
  }

  async create(req: Request, res: Response) {
    const data = createReconciliationSchema.parse(req.body);

    await this.validateClientAccess(req, data.clientId);

    const reconciliation = await prisma.reconciliation.create({
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        status: 'PENDING',
      },
      include: {
        client: true,
      },
    });

    return res.status(201).json(reconciliation);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const data = req.body;

    if (data.clientId) {
      await this.validateClientAccess(req, data.clientId);
    }

    const scope = await this.userScope(req);
    const where: any = { id, ...scope };

    const existing = await prisma.reconciliation.findFirst({ where });

    if (!existing) {
      throw new AppError('Reconciliação não encontrada', 404);
    }

    const reconciliation = await prisma.reconciliation.update({
      where: { id },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        completedAt: data.status === 'COMPLETED' ? new Date() : undefined,
      },
      include: {
        client: true,
      },
    });

    return res.json(reconciliation);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    const scope = await this.userScope(req);
    const where: any = { id, ...scope };

    const existing = await prisma.reconciliation.findFirst({ where });

    if (!existing) {
      throw new AppError('Reconciliação não encontrada', 404);
    }

    await prisma.reconciliation.delete({
      where: { id },
    });

    return res.status(204).send();
  }
}
