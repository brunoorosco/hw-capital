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
}
