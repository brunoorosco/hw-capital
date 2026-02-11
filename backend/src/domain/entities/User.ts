export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export class User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: User) {
    Object.assign(this, props);
  }
}
