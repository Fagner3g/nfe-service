import prisma from '../prisma';

export interface IUserDao {
  name: string;
  email: string;
}

class UserDao {
  async siginIn({ email, name }: IUserDao) {
    return await prisma.user.create({ data: { name, email } });
  }
}

export default new UserDao();
