import { TLoginGoogleUsecase, ILoginGoogleUsecase } from './ILoginGoogleUsecase';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import jwt from 'jsonwebtoken';
import { inject, injectable } from 'tsyringe';
import { AuthProvider } from '@domain/entities/User';
import { IdempotencyParameterMismatch } from '@aws-sdk/client-s3';

interface IGoogleIdTokenPayload {
  email: string;
  name: string;
  picture?: string;
  sub: string;
  email_verified?: boolean;
  aud?: string;
  iat?: number;
  exp?: number;
}

@injectable()
export class LoginGoogleUsecase implements ILoginGoogleUsecase {
  constructor(
    @inject('PrismaUserRepository')
    private readonly userRepository: IUserRepository
  ) {}

  async auth(params: TLoginGoogleUsecase.Params): Promise<TLoginGoogleUsecase.Result> {
     let googleData: IGoogleIdTokenPayload;

     console.log('params :>> ', params);
  try {
    // ✅ Trocar jwt.decode por chamada à API do Google
    const googleResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${params.token}` }
    });

    if (!googleResponse.ok) {
      throw new Error(`Token inválido: ${googleResponse.status}`);
    }

    const decoded = await googleResponse.json();
if (!decoded) throw new Error('Token do Google inválido ou malformado');

    if (!decoded?.email) throw new Error('Token não contém email');
    if (!decoded?.name) throw new Error('Token não contém nome de usuário');
    if (!decoded?.sub) throw new Error('Token não contém ID do Google (sub)');

      googleData = {
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture || undefined,
        sub: decoded.sub,
        email_verified: decoded.email_verified,
      };

      console.log(
        `[Google Auth] Usuário autenticado: ${googleData.email} (${googleData.name})`
      );

      // Buscar usuário existente pelo Google ID ou email
      let user = await this.userRepository.findByGoogleId(googleData.sub);

      if (!user) {
        // Verificar se há usuário com esse email vindo de outro provider
        user = await this.userRepository.findByEmail(googleData.email);

        if (!user) {
          // Criar novo usuário
          console.log(
            `[Google Auth] Criando novo usuário: ${googleData.email}`
          );

          user = await this.userRepository.create({
            name: googleData.name,
            email: googleData.email,
            googleId: googleData.sub,
            picture: googleData.picture,
            provider: AuthProvider.GOOGLE,
            active: true,
            role: 'USER',
          });
        } else {
          // Atualizar usuário existente com dados do Google
          console.log(
            `[Google Auth] Atualizando usuário existente: ${googleData.email}`
          );

          user = await this.userRepository.update(user.id, {
            googleId: googleData.sub,
            picture: googleData.picture,
            provider: AuthProvider.GOOGLE,
          });
        }
      } else {
        console.log(
          `[Google Auth] Usuário encontrado: ${googleData.email}`
        );
      }

      // Se chegou aqui, user está pronto
      const accessToken = Buffer.from(
        JSON.stringify({
          sub: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          provider: user.provider,
        })
      ).toString('base64');

      await this.userRepository.updateAccessToken(user.id, accessToken);

      return {
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          picture: user.picture,
        },
      };
    } catch (error: any) {
      console.error('Google token validation error:', error.message);

      // Erros de validação de JWT
      if (error.message && error.message.includes('Token')) {
        throw new Error(`Token inválido: ${error.message}`);
      }

      if (
        error.message &&
        (error.message.includes('não contém') ||
          error.message.includes('expirou'))
      ) {
        throw new Error(`Token do Google inválido: ${error.message}`);
      }

      // Erros de banco de dados/repositório
      if (error.message && error.message.includes('Erro ao')) {
        throw new Error(error.message);
      }

      console.error('Erro desconhecido durante autenticação:', error);
      throw new Error(`Erro ao autenticar com Google: ${error.message || error}`);
    }
  }
}