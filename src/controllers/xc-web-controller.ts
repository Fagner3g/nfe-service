import { FastifyReply, FastifyRequest } from 'fastify';
import { SignIn, XcWebService } from '../services/xc-web-service';

class XcWebController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    if (!request.body) {
      return reply.code(400).send({ msg: 'Preecha todos os campos' });
    }
    const { password, username } = request.body as SignIn;

    if (!password && !username) {
      return reply.code(400).send({ msg: 'Preecha todos os campos' });
    }

    try {
      const xcWebService = new XcWebService();
      const result = await xcWebService.execute({ password, username });
      reply.send(result);
    } catch (e) {
      if (e instanceof Error) {
        if (e.message.includes('ERR_TIMED_OUT')) {
          reply.code(408).send({ msg: 'Timeout' });
        } else {
          reply.code(400).send({ msg: e.message });
        }
      }
    }
  }
}

export { XcWebController };
