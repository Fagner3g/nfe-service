import { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from 'fastify';
import { XcWebController } from './controllers/xc-web-controller';

export default async function routes(app: FastifyInstance, opt: FastifyPluginOptions) {
  app.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    return new XcWebController().handle (request, reply);
  });
}
