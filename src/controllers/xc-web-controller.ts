import { FastifyReply, FastifyRequest } from 'fastify';
import { XcApiService } from '../services/xc-api-service';
import { xcUserService } from '../services/xc-user-service';
import { xcParagliderService } from '../services/xc-paraglider-service';
import { Page } from 'puppeteer';

class XcWebController {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async handle(request: FastifyRequest, reply: FastifyReply) {
    if (!request.body) {
      return reply.code(400).send({ msg: 'Preecha todos os campos' });
    }

    const { password, username } = request.body as { password: string; username: string };
    if (!password && !username) {
      return reply.code(400).send({ msg: 'Preecha todos os campos' });
    }

    const xcApiService = new XcApiService(this.page);
    try {
      const { id } = await xcApiService.signIn({ password, username });
      try {
        await xcUserService.insertUser({ id, password, username });
        const user = await xcUserService.getUserName(this.page);
        const { glider, takeoff } = await xcParagliderService.getGliderAndTakeoff(this.page, id);
        await xcApiService.closeInstance();
        reply.send({ id, user, glider, takeoff });
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
    } catch (error) {
      reply.code(401).send({ msg: error.message });
    }
  }
}

export { XcWebController };
