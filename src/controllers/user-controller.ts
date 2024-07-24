import { FastifyReply, FastifyRequest } from 'fastify';
import userDao, { IUserDao } from '../dao/user-dao';

class UserController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { email, name } = request.body as IUserDao;
    if (!email || !name) {
      return reply.code(400).send({ msg: 'Email e nome devem ser informados' });
    }

    try {
      try {
        await userDao.siginIn({ email, name });
        reply.send({ msg: 'ok' });
      } catch (e) {
        if (e instanceof Error) {
          reply.code(400).send({ msg: e.message });
        }
      }
    } catch (error) {
      if (error.message.includes('ERR_TIMED_OUT')) {
        reply.code(408).send({ msg: 'Timeout' });
      }
      reply.code(401).send({ msg: error.message });
    }
  }
}

export { UserController };
