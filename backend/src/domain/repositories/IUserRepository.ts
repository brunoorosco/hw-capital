import { User } from '../entities/User';

export interface CreateUserDTO {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  picture?: string;
  provider: string;
  role?: string;
  active?: boolean;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
  picture?: string;
  active?: boolean;
  role?: string;
}

export interface IUserRepository {
  create(data: CreateUserDTO): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  update(id: string, data: UpdateUserDTO): Promise<User>;
  updateAccessToken(id: string, accessToken: string): Promise<void>;
  findAll(limit?: number, offset?: number): Promise<User[]>;
}
