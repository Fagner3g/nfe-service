import { FastifyReply, FastifyRequest } from 'fastify';
import { SignIn, XcWebService } from '../services/xc-web-service';

class XcWebController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { password, username } = request.body as SignIn;

    const xcWebService = new XcWebService();
    const result = await xcWebService.execute({ password, username });
    reply.send(result);
  }
}

export { XcWebController };
