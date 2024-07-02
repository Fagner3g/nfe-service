import Fastify from 'fastify';
import routes from './routes';
import fastifyCors from '@fastify/cors';
const app = Fastify({ logger: true });

const start = async () => {
  await app.register(fastifyCors);
  await app.register(routes);

  try {
    await app.listen({ port: 3000 });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
