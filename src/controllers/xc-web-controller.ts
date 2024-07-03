import { FastifyReply, FastifyRequest } from 'fastify';
import { xcApiService } from '../services/xc-api-service';
import { xcUserService } from '../services/xc-user-service';
import { xcParagliderService } from '../services/xc-paraglider-service';

class XcWebController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    if (!request.body) {
      return reply.code(400).send({ msg: 'Preecha todos os campos' });
    }
    const { password, username } = request.body as { password: string; username: string };
    if (!password && !username) {
      return reply.code(400).send({ msg: 'Preecha todos os campos' });
    }

    try {
      const { page, id } = await xcApiService.getInstance({ password, username });
      const user = await xcUserService.getUserName(page);
      const { glider, takeoff } = await xcParagliderService.getGliderAndTakeoff(page, id);
      await new Promise((resolve) => setTimeout(resolve, 10000));
      await xcApiService.closeInstance();
      reply.send({ user, glider, takeoff });
    } catch (e) {
      if (e instanceof Error) {
        xcApiService.closeInstance();
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
