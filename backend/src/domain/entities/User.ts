export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
}

export class User {
  id: string;
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  picture?: string;
  provider: AuthProvider;
  role: UserRole;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: User) {
    Object.assign(this, props);
  }
}
