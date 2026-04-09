import { TLoginGoogleUsecase, ILoginGoogleUsecase } from './ILoginGoogleUsecase';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import axios from 'axios';
import { inject, injectable } from 'tsyringe';
import { AuthProvider } from '@domain/entities/User';

interface IGoogleIdTokenPayload {
  email: string;
  name: string;
  picture?: string;
  sub: string;
}

@injectable()
export class LoginGoogleUsecase implements ILoginGoogleUsecase {
  constructor(
    @inject('PrismaUserRepository')
    private readonly userRepository: IUserRepository
  ) {}

  async auth(params: TLoginGoogleUsecase.Params): Promise<TLoginGoogleUsecase.Result> {
    // Validar token com Google
    let googleData: IGoogleIdTokenPayload;

    try {
      const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${params.token}` },
      });

      if (!response.data.email || !response.data.name) {
        throw new Error('Google profile incomplete');
      }

      googleData = {
        email: response.data.email,
        name: response.data.name,
        picture: response.data.picture,
        sub: response.data.sub,
      };
    } catch (error: any) {
      console.error('Google token validation error:', error.message);
      
      if (error.response?.status === 401) {
        throw new Error('Token do Google inválido ou expirado');
      }
      
      if (error.message === 'Google profile incomplete') {
        throw new Error('Perfil do Google incompleto. Email e nome são obrigatórios');
      }
      
      throw new Error('Erro ao validar token com Google');
    }

    try {
      // Buscar usuário existente pelo Google ID ou email
      let user = await this.userRepository.findByGoogleId(googleData.sub);

      if (!user) {
        // Verificar se há usuário com esse email vindo de outro provider
        user = await this.userRepository.findByEmail(googleData.email);

        if (!user) {
          // Criar novo usuário
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
          user = await this.userRepository.update(user.id, {
            googleId: googleData.sub,
            picture: googleData.picture,
            provider: AuthProvider.GOOGLE,
          });
        }
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
      console.error('User repository error:', error.message);
      throw new Error(`Erro ao criar ou atualizar usuário: ${error.message}`);
    }
  }
}
