import { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from 'fastify';
import { NFEController } from './controllers/nfe-controller';
import { UserController } from './controllers/user-controller';

export default async function routes(app: FastifyInstance, opt: FastifyPluginOptions) {
  app.post('/user', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await new UserController().handle(request, reply);
    } catch (error) {
      reply.code(500).send(error);
    }
  });

  app.get('/parse', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await new NFEController().handle(request, reply);
    } catch (error) {
      reply.code(500).send(error);
    }
  });
}
