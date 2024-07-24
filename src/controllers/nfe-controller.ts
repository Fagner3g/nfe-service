import { FastifyReply, FastifyRequest } from 'fastify';
import { nfeParseService } from '../services/nfeParseService';

class NFEController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { barcode } = request.query as { barcode: string };
    if (!barcode) {
      return reply.code(400).send({ msg: 'Barcode é requerido' });
    }

    try {
      try {
        const resp = await nfeParseService.findBarcode(barcode);
        console.log(resp);
        reply.send(resp);
      } catch (e) {
        if (e instanceof Error) {
          // await this.page.close();
          reply.code(400).send({ msg: e.message });
        }
      }
    } catch (error) {
      if (error.message.includes('ERR_TIMED_OUT')) {
        reply.code(408).send({ msg: 'Timeout' });
      }
      reply.code(401).send({ msg: error.message });
    }
  }
}

export { NFEController };
