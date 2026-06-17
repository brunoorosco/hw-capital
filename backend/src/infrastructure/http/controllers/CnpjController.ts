import { Request, Response } from 'express';
import axios from 'axios';
import { AppError } from '../middlewares/errorHandler';

export class CnpjController {
  async lookup(req: Request, res: Response) {
    const { cnpj } = req.params;
    const cnpjValue = Array.isArray(cnpj) ? cnpj[0] : cnpj;

    const cleanCnpj = cnpjValue.replace(/\D/g, '');

    if (cleanCnpj.length !== 14) {
      throw new AppError('CNPJ inválido', 400);
    }

    try {
      const response = await axios.get(`https://receitaws.com.br/v1/cnpj/${cleanCnpj}`, {
        timeout: 10000,
      });

      const data = response.data;

      if (data.status === 'ERROR') {
        throw new AppError(data.message || 'CNPJ não encontrado', 404);
      }

      const result = {
        cnpj: data.cnpj,
        razaoSocial: data.nome,
        nomeFantasia: data.fantasia,
        logradouro: data.logradouro,
        numero: data.numero,
        complemento: data.complemento,
        bairro: data.bairro,
        cidade: data.municipio,
        estado: data.uf,
        cep: data.cep,
        email: data.email,
        telefone: data.telefone,
        porte: data.porte,
        atividadePrincipal: data.atividade_principal?.[0]?.text,
      };

      return res.json(result);
    } catch (error: any) {
      if (error instanceof AppError) throw error;

      if (error.response?.status === 429) {
        throw new AppError('Limite de consultas atingido. Tente novamente em alguns segundos.', 429);
      }

      throw new AppError('Erro ao consultar CNPJ', 502);
    }
  }
}
