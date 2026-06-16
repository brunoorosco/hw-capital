import { Request, Response } from 'express';
import { PrismaClient } from '../../database/prisma/PrismaClient';
import PDFDocument from 'pdfkit';
import { AppError } from '../middlewares/errorHandler';

const prisma = PrismaClient.getInstance();

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('pt-BR');
}

export class ReportController {
  async cashFlowReport(req: Request, res: Response) {
    const { clientId, startDate, endDate } = req.query as Record<string, string | undefined>;

    if (!clientId) {
      throw new AppError('clientId é obrigatório', 400);
    }

    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new AppError('Cliente não encontrado', 404);
    }

    const where: any = { clientId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const movements = await prisma.cashFlowMovement.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    const entradas = movements
      .filter(m => m.type === 'ENTRADA')
      .reduce((sum, m) => sum + Number(m.amount), 0);

    const saidas = movements
      .filter(m => m.type === 'SAIDA')
      .reduce((sum, m) => sum + Number(m.amount), 0);

    const saldo = entradas - saidas;

    const monthlyMap = new Map<string, { entradas: number; saidas: number }>();
    for (const m of movements) {
      const d = new Date(m.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const entry = monthlyMap.get(key) || { entradas: 0, saidas: 0 };
      if (m.type === 'ENTRADA') entry.entradas += Number(m.amount);
      else entry.saidas += Number(m.amount);
      monthlyMap.set(key, entry);
    }

    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const sortedMonths = Array.from(monthlyMap.keys()).sort();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="fluxo-caixa-${client.name.replace(/\s+/g, '-').toLowerCase()}.pdf"`);

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: `Fluxo de Caixa - ${client.name}`,
        Author: 'HW Capital',
        Subject: 'Demonstrativo de Fluxo de Caixa',
      },
    });

    doc.pipe(res);

    const pageWidth = doc.page.width - 100;
    const leftMargin = 50;
    let y = 50;

    doc.font('Helvetica-Bold', 20)
      .fillColor('#1a1a2e')
      .text('HW CAPITAL', leftMargin, y, { align: 'center' })
      .moveDown(0.3);

    y = doc.y;
    doc.font('Helvetica', 10)
      .fillColor('#666')
      .text('BPO Financeiro', { align: 'center' });

    y = doc.y + 25;

    doc.font('Helvetica-Bold', 18)
      .fillColor('#1a1a2e')
      .text('Demonstrativo de Fluxo de Caixa', leftMargin, y, { align: 'center' });

    y = doc.y + 15;

    doc.moveTo(leftMargin, y)
      .lineTo(leftMargin + pageWidth, y)
      .strokeColor('#D4AF37')
      .stroke();

    y = doc.y + 20;

    const rightEdge = leftMargin + pageWidth;

    function rightAlignText(d: typeof doc, text: string, rowY: number) {
      const w = d.widthOfString(text);
      d.text(text, rightEdge - w, rowY);
    }

    const row1Y = y;
    doc.font('Helvetica-Bold', 11).fillColor('#333')
      .text('Cliente:', leftMargin, row1Y, { continued: true });
    doc.font('Helvetica', 11).fillColor('#555')
      .text(` ${client.name}`);

    doc.font('Helvetica-Bold', 11).fillColor('#333');
    rightAlignText(doc, `CNPJ: ${client.cnpj}`, row1Y);

    y = doc.y + 5;

    const row2Y = y;
    doc.font('Helvetica-Bold', 11).fillColor('#333')
      .text('Período:', leftMargin, row2Y, { continued: true });
    doc.font('Helvetica', 11).fillColor('#555')
      .text(` ${startDate ? formatDate(startDate) : 'Início'} a ${endDate ? formatDate(endDate) : 'Hoje'}`);

    doc.font('Helvetica-Bold', 11).fillColor('#333');
    rightAlignText(doc, `Data do Relatório: ${formatDate(new Date())}`, row2Y);

    y = doc.y + 25;

    doc.roundedRect(leftMargin, y, pageWidth, 70, 4)
      .fillColor('#f8f6f0')
      .fill();

    const cardW = (pageWidth - 30) / 3;
    const cardY = y + 12;

    doc.font('Helvetica', 9).fillColor('#666');
    doc.text('ENTRADAS', leftMargin + 10, cardY, { width: cardW, align: 'center' });
    doc.font('Helvetica-Bold', 14).fillColor('#16a34a');
    doc.text(formatCurrency(entradas), leftMargin + 10, cardY + 14, { width: cardW, align: 'center' });

    doc.font('Helvetica', 9).fillColor('#666');
    doc.text('SAÍDAS', leftMargin + 20 + cardW, cardY, { width: cardW, align: 'center' });
    doc.font('Helvetica-Bold', 14).fillColor('#dc2626');
    doc.text(formatCurrency(saidas), leftMargin + 20 + cardW, cardY + 14, { width: cardW, align: 'center' });

    doc.font('Helvetica', 9).fillColor('#666');
    doc.text('SALDO', leftMargin + 40 + cardW * 2, cardY, { width: cardW, align: 'center' });
    doc.font('Helvetica-Bold', 14).fillColor(saldo >= 0 ? '#16a34a' : '#dc2626');
    doc.text(formatCurrency(saldo), leftMargin + 40 + cardW * 2, cardY + 14, { width: cardW, align: 'center' });

    // Add a subtle border around the summary card
    doc.roundedRect(leftMargin, y, pageWidth, 70, 4)
      .lineWidth(1)
      .strokeColor('#D4AF37')
      .stroke();

    y = y + 90;

    if (sortedMonths.length > 0) {
      doc.font('Helvetica-Bold', 13)
        .fillColor('#1a1a2e')
        .text('Evolução Mensal', leftMargin, y);

      y = doc.y + 10;

      const tableTop = y;
      const colX = [leftMargin, leftMargin + 180, leftMargin + 270, leftMargin + pageWidth - 80];

      doc.roundedRect(leftMargin, tableTop, pageWidth, 18, 3)
        .fillColor('#1a1a2e')
        .fill();

      doc.font('Helvetica-Bold', 9).fillColor('#fff');
      doc.text('Mês', colX[0] + 8, tableTop + 4);
      doc.text('Entradas', colX[1] + 8, tableTop + 4);
      doc.text('Saídas', colX[2] + 8, tableTop + 4);
      doc.text('Saldo', colX[3] + 8, tableTop + 4);

      y = tableTop + 18;

      for (const key of sortedMonths) {
        const data = monthlyMap.get(key)!;
        const monthSaldo = data.entradas - data.saidas;
        const [year, monthNum] = key.split('-');
        const monthLabel = `${monthNames[parseInt(monthNum) - 1]}/${year}`;

        const isEven = sortedMonths.indexOf(key) % 2 === 0;
        if (isEven) {
          doc.rect(leftMargin, y, pageWidth, 18).fillColor('#f8f6f0').fill();
        }

        doc.rect(leftMargin, y, pageWidth, 18).lineWidth(0.5).strokeColor('#e5e5e5').stroke();

        doc.font('Helvetica', 10).fillColor('#333');
        doc.text(monthLabel, colX[0] + 8, y + 3);
        doc.font('Helvetica', 10).fillColor('#16a34a');
        doc.text(formatCurrency(data.entradas), colX[1] + 8, y + 3);
        doc.font('Helvetica', 10).fillColor('#dc2626');
        doc.text(formatCurrency(data.saidas), colX[2] + 8, y + 3);
        doc.font('Helvetica-Bold', 10).fillColor(monthSaldo >= 0 ? '#16a34a' : '#dc2626');
        doc.text(formatCurrency(monthSaldo), colX[3] + 8, y + 3);

        y += 18;
      }

      y += 25;
    }

    if (movements.length > 0) {
      if (y > 600) {
        doc.addPage();
        y = 50;
      }

      doc.font('Helvetica-Bold', 13)
        .fillColor('#1a1a2e')
        .text('Movimentações Detalhadas', leftMargin, y);

      y = doc.y + 10;

      const detColX = [leftMargin, leftMargin + 70, leftMargin + 220, leftMargin + pageWidth - 100];

      doc.roundedRect(leftMargin, y, pageWidth, 18, 3)
        .fillColor('#1a1a2e')
        .fill();

      doc.font('Helvetica-Bold', 9).fillColor('#fff');
      doc.text('Data', detColX[0] + 6, y + 4);
      doc.text('Tipo', detColX[1] + 6, y + 4);
      doc.text('Descrição', detColX[2] + 6, y + 4);
      doc.text('Valor', detColX[3] + 6, y + 4);

      y += 18;

      for (const m of movements) {
        if (y > 750) {
          doc.addPage();
          y = 50;

          doc.roundedRect(leftMargin, y, pageWidth, 18, 3)
            .fillColor('#1a1a2e')
            .fill();

          doc.font('Helvetica-Bold', 9).fillColor('#fff');
          doc.text('Data', detColX[0] + 6, y + 4);
          doc.text('Tipo', detColX[1] + 6, y + 4);
          doc.text('Descrição', detColX[2] + 6, y + 4);
          doc.text('Valor', detColX[3] + 6, y + 4);

          y += 18;
        }

        const isEven = movements.indexOf(m) % 2 === 0;
        if (isEven) {
          doc.rect(leftMargin, y, pageWidth, 18).fillColor('#f8f6f0').fill();
        }

        doc.rect(leftMargin, y, pageWidth, 18).lineWidth(0.5).strokeColor('#e5e5e5').stroke();

        const isEntrada = m.type === 'ENTRADA';

        doc.font('Helvetica', 9).fillColor('#333');
        doc.text(formatDate(m.date), detColX[0] + 6, y + 3);

        doc.font('Helvetica-Bold', 9).fillColor(isEntrada ? '#16a34a' : '#dc2626');
        doc.text(isEntrada ? 'ENTRADA' : 'SAÍDA', detColX[1] + 6, y + 3);

        doc.font('Helvetica', 9).fillColor('#333');
        const desc = m.description.length > 35 ? m.description.slice(0, 35) + '…' : m.description;
        doc.text(desc, detColX[2] + 6, y + 3);

        doc.font('Helvetica-Bold', 9).fillColor(isEntrada ? '#16a34a' : '#dc2626');
        doc.text(formatCurrency(Number(m.amount)), detColX[3] + 6, y + 3);

        y += 18;
      }
    }

    const footerY = doc.page.height - 60;

    doc.moveTo(leftMargin, footerY)
      .lineTo(leftMargin + pageWidth, footerY)
      .strokeColor('#D4AF37')
      .stroke();

    doc.font('Helvetica', 8)
      .fillColor('#999')
      .text(
        `HW Capital - BPO Financeiro | Gerado em ${formatDate(new Date())} às ${new Date().toLocaleTimeString('pt-BR')}`,
        leftMargin,
        footerY + 5,
        { align: 'center' }
      );

    doc.end();
  }
}
