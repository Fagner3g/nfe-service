import { User } from '@prisma/client';
import prisma from '../prisma';

export interface UserLogged {
  id: string;
  password: string;
  civilId?: string;
  email?: string;
}

class UserDao {
  async siginIn({ id, password, civilId, email }: UserLogged) {
    return await prisma.user.upsert({
      where: { id },
      create: { id, password, civilId, email },
      update: { civilId, email, password },
    });
  }
}

export default new UserDao();
