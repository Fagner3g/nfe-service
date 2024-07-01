import { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from 'fastify';

export default async function routes(app: FastifyInstance, opt: FastifyPluginOptions) {
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    return { hello: 'world' };
  }); 
}
