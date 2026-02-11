import { Request, Response } from 'express';
import { prisma } from '../../database/prisma/PrismaClient';

export class PlanController {
  // Listar todos os planos
  async list(req: Request, res: Response) {
    try {
      const plans = await prisma.plan.findMany({
        orderBy: {
          price: 'asc',
        },
      });

      return res.json(plans);
    } catch (error: any) {
      console.error('Erro ao listar planos:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao listar planos',
      });
    }
  }

  // Buscar plano por ID
  async show(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const plan = await prisma.plan.findUnique({
        where: { id },
      });

      if (!plan) {
        return res.status(404).json({
          status: 'error',
          message: 'Plano não encontrado',
        });
      }

      return res.json(plan);
    } catch (error: any) {
      console.error('Erro ao buscar plano:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao buscar plano',
      });
    }
  }

  // Criar plano
  async create(req: Request, res: Response) {
    try {
      const { name, price, description, features, active } = req.body;

      const plan = await prisma.plan.create({
        data: {
          name,
          price,
          description,
          features,
          active: active ?? true,
        },
      });

      return res.status(201).json(plan);
    } catch (error: any) {
      console.error('Erro ao criar plano:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao criar plano',
      });
    }
  }

  // Atualizar plano
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, price, description, features, active } = req.body;

      const plan = await prisma.plan.update({
        where: { id },
        data: {
          name,
          price,
          description,
          features,
          active,
        },
      });

      return res.json(plan);
    } catch (error: any) {
      console.error('Erro ao atualizar plano:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao atualizar plano',
      });
    }
  }

  // Deletar plano
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.plan.delete({
        where: { id },
      });

      return res.status(204).send();
    } catch (error: any) {
      console.error('Erro ao deletar plano:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao deletar plano',
      });
    }
  }
}
