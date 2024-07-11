import { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from 'fastify';
import { XcWebController } from './controllers/xc-web-controller';
import { Cluster } from 'puppeteer-cluster';
import { ClusterService } from './services/cluster-service';

export default async function routes(app: FastifyInstance, opt: FastifyPluginOptions) {
  const clusterConfig = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 2,
  });

  const clusterService = new ClusterService(clusterConfig);
  const cluster = clusterService.getCluster();

  app.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await cluster.task(async ({ page, worker }) => {
        try {
          const xcWebService = new XcWebController(page);
          await xcWebService.handle(request, reply);

          console.log('📍 Close ProcessId: ', worker.id);
        } catch (error) {
          reply.code(400).send(error);
        }
      });

      await cluster.queue({});

      await clusterService.closeCluster();
    } catch (error) {
      reply.code(500).send(error);
    }
  });
}
