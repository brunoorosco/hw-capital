import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await prisma.auditLog.deleteMany();
  await prisma.file.deleteMany();
  await prisma.divergence.deleteMany();
  await prisma.reconciliationTransaction.deleteMany();
  await prisma.reconciliation.deleteMany();
  await prisma.cashFlowMovement.deleteMany();
  await prisma.client.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Dados antigos removidos');

  // Criar usuários
  const passwordHash = await bcrypt.hash('123456', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin HW Capital',
      email: 'admin@hwcapital.com.br',
      password: passwordHash,
      role: 'ADMIN',
      active: true,
    },
  });

  const user1 = await prisma.user.create({
    data: {
      name: 'João Silva',
      email: 'joao.silva@hwcapital.com.br',
      password: passwordHash,
      role: 'USER',
      active: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Maria Santos',
      email: 'maria.santos@hwcapital.com.br',
      password: passwordHash,
      role: 'USER',
      active: true,
    },
  });

  console.log('✅ Usuários criados');

  // Criar planos
  const planoBasico = await prisma.plan.create({
    data: {
      name: 'Básico',
      price: 1200.00,
      description: 'Ideal para pequenas empresas que estão começando',
      features: [
        'Conciliação bancária',
        'Relatório DRE mensal',
        'Suporte por email',
      ],
      active: true,
    },
  });

  const planoPremium = await prisma.plan.create({
    data: {
      name: 'Premium',
      price: 2500.00,
      description: 'Para empresas em crescimento que precisam de mais suporte',
      features: [
        'Conciliação bancária',
        'Relatórios completos',
        'Fluxo de caixa',
        'Suporte prioritário',
        'Consultoria mensal',
      ],
      active: true,
    },
  });

  const planoEnterprise = await prisma.plan.create({
    data: {
      name: 'Enterprise',
      price: 5000.00,
      description: 'Solução completa para grandes empresas',
      features: [
        'Todos os recursos Premium',
        'Múltiplas empresas',
        'Consultoria semanal',
        'Suporte 24/7',
        'Relatórios customizados',
      ],
      active: true,
    },
  });

  console.log('✅ Planos criados');

  // Criar clientes
  const client1 = await prisma.client.create({
    data: {
      name: 'Empresa ABC Ltda',
      email: 'contato@empresaabc.com.br',
      phone: '(11) 98765-4321',
      cnpj: '12.345.678/0001-90',
      address: 'Av. Paulista, 1000 - São Paulo, SP',
      plan: 'Premium',
      monthlyValue: 2500.00,
      status: 'active',
      notes: 'Cliente desde janeiro de 2025',
      responsibleId: user1.id,
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'XYZ Comércio',
      email: 'financeiro@xyzcomercio.com.br',
      phone: '(11) 97654-3210',
      cnpj: '98.765.432/0001-10',
      address: 'Rua do Comércio, 500 - São Paulo, SP',
      plan: 'Básico',
      monthlyValue: 1200.00,
      status: 'active',
      responsibleId: user1.id,
    },
  });

  const client3 = await prisma.client.create({
    data: {
      name: 'Tech Solutions',
      email: 'admin@techsolutions.com',
      phone: '(11) 96543-2109',
      cnpj: '11.222.333/0001-44',
      address: 'Av. Faria Lima, 2000 - São Paulo, SP',
      plan: 'Enterprise',
      monthlyValue: 5000.00,
      status: 'active',
      responsibleId: user2.id,
    },
  });

  const client4 = await prisma.client.create({
    data: {
      name: 'Serviços Pro Ltda',
      email: 'contato@servicospro.com.br',
      phone: '(11) 95432-1098',
      cnpj: '55.666.777/0001-88',
      address: 'Rua dos Serviços, 300 - São Paulo, SP',
      plan: 'Premium',
      monthlyValue: 2500.00,
      status: 'active',
      responsibleId: user2.id,
    },
  });

  console.log('✅ Clientes criados');

  // Criar reconciliações
  const reconciliation1 = await prisma.reconciliation.create({
    data: {
      clientId: client1.id,
      bank: 'Banco do Brasil',
      account: '12345-6',
      period: 'Janeiro 2026',
      startBalance: 45320.00,
      endBalance: 52180.00,
      bankBalance: 52180.00,
      systemBalance: 51980.00,
      difference: 200.00,
      status: 'IN_PROGRESS',
      responsible: 'João Silva',
      startDate: new Date('2026-02-01'),
      dueDate: new Date('2026-02-15'),
      observations: 'Reconciliação em andamento',
    },
  });

  const reconciliation2 = await prisma.reconciliation.create({
    data: {
      clientId: client2.id,
      bank: 'Itaú',
      account: '54321-9',
      period: 'Janeiro 2026',
      startBalance: 23450.00,
      endBalance: 28920.00,
      bankBalance: 28920.00,
      systemBalance: 28920.00,
      difference: 0.00,
      status: 'COMPLETED',
      responsible: 'João Silva',
      startDate: new Date('2026-02-01'),
      dueDate: new Date('2026-02-10'),
      completedAt: new Date('2026-02-09'),
    },
  });

  console.log('✅ Reconciliações criadas');

  // Criar transações de reconciliação
  await prisma.reconciliationTransaction.createMany({
    data: [
      {
        reconciliationId: reconciliation1.id,
        date: new Date('2026-01-28'),
        description: 'TED Recebido - Cliente XYZ',
        type: 'CREDIT',
        amount: 15000.00,
        category: 'Recebimento',
        document: 'TED123456',
        status: 'PENDING',
      },
      {
        reconciliationId: reconciliation1.id,
        date: new Date('2026-01-29'),
        description: 'Pagamento Fornecedor ABC',
        type: 'DEBIT',
        amount: 8500.00,
        category: 'Fornecedor',
        document: 'BOL789012',
        status: 'APPROVED',
      },
      {
        reconciliationId: reconciliation2.id,
        date: new Date('2026-01-15'),
        description: 'Recebimento de vendas',
        type: 'CREDIT',
        amount: 12000.00,
        category: 'Vendas',
        status: 'APPROVED',
      },
    ],
  });

  console.log('✅ Transações criadas');

  // Criar divergências
  await prisma.divergence.create({
    data: {
      reconciliationId: reconciliation1.id,
      date: new Date('2026-01-25'),
      description: 'Diferença de valor - Boleto 12345',
      expectedValue: 1500.00,
      actualValue: 1485.00,
      difference: -15.00,
      status: 'investigating',
      observation: 'Possível desconto não registrado',
    },
  });

  console.log('✅ Divergências criadas');

  // Criar movimentações de fluxo de caixa
  await prisma.cashFlowMovement.createMany({
    data: [
      {
        clientId: client1.id,
        type: 'ENTRADA',
        description: 'Recebimento Cliente A',
        amount: 15000.00,
        date: new Date('2026-02-15'),
        category: 'Vendas',
        status: 'confirmed',
      },
      {
        clientId: client1.id,
        type: 'SAIDA',
        description: 'Pagamento Fornecedor X',
        amount: 8500.00,
        date: new Date('2026-02-18'),
        category: 'Fornecedores',
        status: 'confirmed',
      },
      {
        clientId: client2.id,
        type: 'ENTRADA',
        description: 'Recebimento Cliente B',
        amount: 22000.00,
        date: new Date('2026-02-20'),
        category: 'Vendas',
        status: 'confirmed',
      },
      {
        clientId: client3.id,
        type: 'SAIDA',
        description: 'Folha de Pagamento',
        amount: 35000.00,
        date: new Date('2026-02-25'),
        category: 'Salários',
        status: 'confirmed',
      },
    ],
  });

  console.log('✅ Movimentações de fluxo de caixa criadas');

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📊 Resumo:');
  console.log(`   👥 Usuários: 3 (admin@hwcapital.com.br, senha: 123456)`);
  console.log(`   📋 Planos: 3`);
  console.log(`   🏢 Clientes: 4`);
  console.log(`   🔄 Reconciliações: 2`);
  console.log(`   📝 Transações: 3`);
  console.log(`   ⚠️  Divergências: 1`);
  console.log(`   💰 Movimentações: 4`);
  console.log('\n✅ Você pode fazer login com:');
  console.log('   Email: admin@hwcapital.com.br');
  console.log('   Senha: 123456');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
