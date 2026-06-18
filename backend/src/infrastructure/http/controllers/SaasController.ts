import { Request, Response } from 'express';
import { PrismaClient } from '../../database/prisma/PrismaClient';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import { z } from 'zod';
import { AppError } from '../middlewares/errorHandler';

const prisma = PrismaClient.getInstance();

const mpConfig = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '',
});

const preApproval = new PreApproval(mpConfig);

export class SaasController {
  async listPlans(req: Request, res: Response) {
    const plans = await prisma.saasPlan.findMany({
      where: { active: true },
      orderBy: { price: 'asc' },
    });

    return res.json(plans);
  }

  async mySubscription(req: Request, res: Response) {
    const subscription = await prisma.saasSubscription.findUnique({
      where: { userId: req.user!.id },
      include: {
        plan: true,
        payments: {
          orderBy: { dueDate: 'desc' },
          take: 12,
        },
      },
    });

    if (!subscription) {
      return res.json(null);
    }

    return res.json(subscription);
  }

  async subscribe(req: Request, res: Response) {
    const { planId } = z
      .object({ planId: z.string() })
      .parse(req.body);

    const plan = await prisma.saasPlan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.active) {
      throw new AppError('Plano não encontrado ou inativo', 404);
    }

    const existing = await prisma.saasSubscription.findUnique({
      where: { userId: req.user!.id },
    });

    if (existing?.status === 'ACTIVE') {
      throw new AppError('Você já possui uma assinatura ativa', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Create subscription record in DB (status PENDING until MP confirms)
    const subscription = await prisma.saasSubscription.create({
      data: {
        userId: req.user!.id,
        planId: plan.id,
        status: 'TRIALING',
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days trial
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Create Mercado Pago PreApproval (subscription)
    const mpSubscription = await preApproval.create({
      body: {
        preapproval_plan_id: plan.mercadopagoPlanId || undefined,
        reason: `HW Capital - ${plan.name}`,
        external_reference: subscription.id,
        payer_email: user.email,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: Number(plan.price),
          currency_id: 'BRL',
        },
        back_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/subscription`,
        status: 'authorized',
      },
    });

    // Update subscription with Mercado Pago ID
    await prisma.saasSubscription.update({
      where: { id: subscription.id },
      data: {
        mercadopagoId: mpSubscription.id,
        status: 'ACTIVE',
      },
    });

    // Create initial payment record
    await prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        amount: plan.price,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'PENDING',
        mercadopagoId: mpSubscription.id,
      },
    });

    // Return subscription with Mercado Pago checkout link
    return res.status(201).json({
      subscription,
      mercadopagoUrl: mpSubscription.init_point,
      mercadopagoSandboxUrl: mpSubscription.sandbox_init_point,
    });
  }

  async cancelSubscription(req: Request, res: Response) {
    const sub = await prisma.saasSubscription.findUnique({
      where: { userId: req.user!.id },
    });

    if (!sub) {
      throw new AppError('Assinatura não encontrada', 404);
    }

    // Cancel at Mercado Pago
    if (sub.mercadopagoId) {
      try {
        await preApproval.update({
          id: sub.mercadopagoId,
          body: { status: 'cancelled' },
        });
      } catch {
        // MP error - continue with local cancellation
      }
    }

    await prisma.saasSubscription.update({
      where: { id: sub.id },
      data: {
        status: 'CANCELED',
        cancelAtPeriodEnd: true,
      },
    });

    return res.json({ message: 'Assinatura cancelada com sucesso' });
  }

  async webhook(req: Request, res: Response) {
    const { action, data } = req.body;

    if (action === 'payment.created' || action === 'payment.updated') {
      const paymentId = data?.id;

      if (!paymentId) {
        return res.status(400).json({ message: 'Dados inválidos' });
      }

      try {
        const mpPayment = await preApproval.get({ id: paymentId });

        const subscriptionId = mpPayment.external_reference;

        if (!subscriptionId) {
          return res.status(400).json({ message: 'Referência externa não encontrada' });
        }

        const status = mpPayment.status;

        if (status === 'authorized' || status === 'pending') {
          await prisma.payment.updateMany({
            where: {
              subscriptionId,
              mercadopagoId: paymentId,
            },
            data: { status: 'PAID', paidAt: new Date() },
          });
        } else if (status === 'cancelled') {
          await prisma.payment.updateMany({
            where: {
              subscriptionId,
              mercadopagoId: paymentId,
            },
            data: { status: 'CANCELED' },
          });
        }
      } catch {
        return res.status(500).json({ message: 'Erro ao processar webhook' });
      }
    }

    return res.status(200).json({ message: 'OK' });
  }

  async payments(req: Request, res: Response) {
    const sub = await prisma.saasSubscription.findUnique({
      where: { userId: req.user!.id },
      select: { id: true },
    });

    if (!sub) {
      return res.json([]);
    }

    const payments = await prisma.payment.findMany({
      where: { subscriptionId: sub.id },
      orderBy: { dueDate: 'desc' },
    });

    return res.json(payments);
  }

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  async adminListPlans(req: Request, res: Response) {
    const { includeInactive } = req.query;

    const where: any = {};
    if (includeInactive !== 'true') {
      where.active = true;
    }

    const plans = await prisma.saasPlan.findMany({
      where,
      orderBy: { price: 'asc' },
    });

    return res.json(plans);
  }

  async adminCreatePlan(req: Request, res: Response) {
    const schema = z.object({
      name: z.string().min(1),
      price: z.number().positive(),
      maxClients: z.number().int().positive().default(5),
      description: z.string().optional(),
      features: z.array(z.string()).default([]),
      mercadopagoPlanId: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const plan = await prisma.saasPlan.create({
      data: {
        ...data,
        active: true,
      },
    });

    return res.status(201).json(plan);
  }

  async adminUpdatePlan(req: Request, res: Response) {
    const { id } = req.params;

    const schema = z.object({
      name: z.string().min(1).optional(),
      price: z.number().positive().optional(),
      maxClients: z.number().int().positive().optional(),
      description: z.string().optional(),
      features: z.array(z.string()).optional(),
      active: z.boolean().optional(),
      mercadopagoPlanId: z.string().optional().nullable(),
    });

    const data = schema.parse(req.body);

    const existing = await prisma.saasPlan.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Plano não encontrado', 404);
    }

    const plan = await prisma.saasPlan.update({
      where: { id },
      data,
    });

    return res.json(plan);
  }

  async adminDeletePlan(req: Request, res: Response) {
    const { id } = req.params;

    const existing = await prisma.saasPlan.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Plano não encontrado', 404);
    }

    // Soft delete - just deactivate
    await prisma.saasPlan.update({
      where: { id },
      data: { active: false },
    });

    return res.json({ message: 'Plano desativado com sucesso' });
  }

  async adminListPayments(req: Request, res: Response) {
    const { status, startDate, endDate } = req.query as Record<string, string | undefined>;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.dueDate = {};
      if (startDate) where.dueDate.gte = new Date(startDate);
      if (endDate) where.dueDate.lte = new Date(endDate);
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        subscription: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
            plan: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { dueDate: 'desc' },
      take: 200,
    });

    return res.json(payments);
  }

  async adminListSubscriptions(req: Request, res: Response) {
    const { status } = req.query as Record<string, string | undefined>;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    const subscriptions = await prisma.saasSubscription.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        plan: {
          select: { id: true, name: true, price: true },
        },
        payments: {
          orderBy: { dueDate: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(subscriptions);
  }

  async adminListUsers(req: Request, res: Response) {
    const { search, hasSubscription } = req.query as Record<string, string | undefined>;

    const where: any = {};

    if (hasSubscription === 'true') {
      where.subscription = { isNot: null };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        subscription: {
          include: {
            plan: {
              select: { id: true, name: true, price: true },
            },
          },
        },
        _count: {
          select: { clients: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(users);
  }

  async adminToggleUserRole(req: Request, res: Response) {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const roleCycle: Record<string, string> = {
      USER: 'ADMIN',
      ADMIN: 'SUPER_ADMIN',
      SUPER_ADMIN: 'USER',
    };
    const newRole = roleCycle[user.role] || 'USER';

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: { id: true, name: true, email: true, role: true, active: true },
    });

    return res.json(updated);
  }

  async adminUserPayments(req: Request, res: Response) {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const subscription = await prisma.saasSubscription.findUnique({
      where: { userId },
      include: { plan: { select: { id: true, name: true, price: true } } },
    });

    if (!subscription) {
      return res.json({ user, payments: [] });
    }

    const payments = await prisma.payment.findMany({
      where: { subscriptionId: subscription.id },
      orderBy: { dueDate: 'desc' },
    });

    return res.json({
      user,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        plan: subscription.plan,
      },
      payments,
    });
  }

  async adminDashboard(req: Request, res: Response) {
    const [
      totalUsers,
      totalSubscriptions,
      activeSubscriptions,
      totalClients,
      totalPayments,
      revenue,
      recentPayments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.saasSubscription.count(),
      prisma.saasSubscription.count({ where: { status: 'ACTIVE' } }),
      prisma.client.count(),
      prisma.payment.count(),
      prisma.payment.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
      }),
      prisma.payment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          subscription: {
            include: {
              user: { select: { name: true, email: true } },
              plan: { select: { name: true } },
            },
          },
        },
      }),
    ]);

    return res.json({
      totalUsers,
      totalSubscriptions,
      activeSubscriptions,
      totalClients,
      totalPayments,
      totalRevenue: revenue._sum.amount || 0,
      recentPayments,
    });
  }
}
