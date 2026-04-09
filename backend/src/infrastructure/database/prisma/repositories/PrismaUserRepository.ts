import { injectable } from 'tsyringe';
import { PrismaClient } from '../PrismaClient';
import { User, AuthProvider } from '@domain/entities/User';
import { IUserRepository, CreateUserDTO, UpdateUserDTO } from '@domain/repositories/IUserRepository';

@injectable()
export class PrismaUserRepository implements IUserRepository {
  private prisma = PrismaClient.getInstance();

  async create(data: CreateUserDTO): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password || null,
        googleId: data.googleId || null,
        picture: data.picture || null,
        provider: data.provider,
        role: data.role || 'USER',
        active: data.active !== false,
      },
    });

    return this.mapToDomain(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user ? this.mapToDomain(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? this.mapToDomain(user) : null;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { googleId },
    });

    return user ? this.mapToDomain(user) : null;
  }

  async update(id: string, data: UpdateUserDTO): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        picture: data.picture,
        active: data.active,
        role: data.role,
      },
    });

    return this.mapToDomain(user);
  }

  async updateAccessToken(id: string, accessToken: string): Promise<void> {
    // Store access token in a session/cache if needed
    // This is a placeholder - adjust based on your token storage strategy
    await this.prisma.user.update({
      where: { id },
      data: {
        updatedAt: new Date(),
      },
    });
  }

  async findAll(limit: number = 50, offset: number = 0): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users.map(user => this.mapToDomain(user));
  }

  private mapToDomain(user: any): User {
    return new User({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      googleId: user.googleId,
      picture: user.picture,
      provider: user.provider as AuthProvider,
      role: user.role as any,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}
