import { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from 'fastify';
import { NFEController } from './controllers/nfe-controller';

export default async function routes(app: FastifyInstance, opt: FastifyPluginOptions) {
  app.get('/parse', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await new NFEController().handle(request, reply);
    } catch (error) {
      reply.code(500).send(error);
    }
  });
}
