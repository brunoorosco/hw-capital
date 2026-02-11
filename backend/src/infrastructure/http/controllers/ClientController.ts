import { Request, Response } from 'express';
import { PrismaClient } from '../../database/prisma/PrismaClient';
import { z } from 'zod';
import { AppError } from '../middlewares/errorHandler';

const prisma = PrismaClient.getInstance();

const createClientSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  phone: z.string(),
  cnpj: z.string(),
  address: z.string().optional(),
  plan: z.string(),
  monthlyValue: z.number().positive(),
  notes: z.string().optional(),
  responsibleId: z.string().optional(),
});

const updateClientSchema = createClientSchema.partial();

export class ClientController {
  async list(req: Request, res: Response) {
    const { search, status } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { cnpj: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const clients = await prisma.client.findMany({
      where,
      include: {
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json(clients);
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reconciliations: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        cashFlows: {
          take: 10,
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!client) {
      throw new AppError('Cliente não encontrado', 404);
    }

    return res.json(client);
  }

  async create(req: Request, res: Response) {
    const data = createClientSchema.parse(req.body);

    // Verificar se CNPJ já existe
    const cnpjExists = await prisma.client.findUnique({
      where: { cnpj: data.cnpj },
    });

    if (cnpjExists) {
      throw new AppError('CNPJ já cadastrado', 400);
    }

    const client = await prisma.client.create({
      data: {
        ...data,
        status: 'active',
      },
      include: {
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(201).json(client);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const data = updateClientSchema.parse(req.body);

    const clientExists = await prisma.client.findUnique({
      where: { id },
    });

    if (!clientExists) {
      throw new AppError('Cliente não encontrado', 404);
    }

    const client = await prisma.client.update({
      where: { id },
      data,
      include: {
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.json(client);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    const clientExists = await prisma.client.findUnique({
      where: { id },
    });

    if (!clientExists) {
      throw new AppError('Cliente não encontrado', 404);
    }

    await prisma.client.delete({
      where: { id },
    });

    return res.status(204).send();
  }

  async deactivate(req: Request, res: Response) {
    const { id } = req.params;

    const client = await prisma.client.update({
      where: { id },
      data: { status: 'inactive' },
    });

    return res.json(client);
  }
}
