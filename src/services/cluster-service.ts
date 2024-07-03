import { Cluster } from 'puppeteer-cluster';

export class ClusterService {
  private cluster: Cluster<any, any>;

  constructor(cluster: Cluster<any, any>) {
    console.log('create cluster 🚀🚀🚀🚀');
    this.cluster = cluster;
  }

  getCluster() {
    if (!this.cluster) {
      throw new Error('Cluster not created');
    }
    return this.cluster;
  }

  async closeCluster() {
    if (!this.cluster) {
      throw new Error('Cluster not created');
    }
    await this.cluster.idle();
    await this.cluster.close();
  }
}
