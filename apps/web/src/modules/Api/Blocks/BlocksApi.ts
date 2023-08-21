import { TBlockType } from '~/contracts';
import { HttpClient, createHttpClient } from '~/utils';

export class BlocksApi {
  public baseUrl = `/block_types`;
  private client: HttpClient;

  constructor(client: HttpClient = createHttpClient()) {
    this.client = client;
  }

  getBlockTypes() {
    return this.client.get<{ data: TBlockType[] }>(`${this.baseUrl}`);
  }
}
