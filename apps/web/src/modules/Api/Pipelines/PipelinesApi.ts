import { TCreatePipeline, TPipeline } from '~/contracts';
import { HttpClient, createHttpClient } from '~/utils';

export class PipelinesApi {
  public baseUrl = `/pipelines`;
  private client: HttpClient;

  constructor(client: HttpClient = createHttpClient()) {
    this.client = client;
  }

  // TODO (hub33k): return from backend just array?
  //   how to type this?
  getAll() {
    return this.client.get<{ data: TPipeline[] }>(`${this.baseUrl}`);
  }

  get(id: string) {
    return this.client.get<TPipeline>(`${this.baseUrl}/${id}`);
  }

  create(payload: TCreatePipeline) {
    return this.client.post<TCreatePipeline>(`${this.baseUrl}`, payload);
  }

  delete(id: string) {
    return this.client.delete(`${this.baseUrl}/${id}`);
  }
}
