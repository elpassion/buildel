import { TCreatePipeline, TPipeline } from '~/contracts';
import { HttpClient, createHttpClient } from '~/utils';

export class PipelinesApi {
  public baseUrl = (organizationId: string) =>
    `/organizations/${organizationId}/pipelines`;
  private client: HttpClient;

  constructor(client: HttpClient = createHttpClient()) {
    this.client = client;
  }

  // TODO (hub33k): return from backend just array?
  //   how to type this?
  getAll(organizationId: string) {
    return this.client.get<{ data: TPipeline[] }>(
      `${this.baseUrl(organizationId)}`,
    );
  }

  get(organizationId: string, id: string) {
    return this.client.get<TPipeline>(`${this.baseUrl(organizationId)}/${id}`);
  }

  create(organizationId: string, payload: TCreatePipeline) {
    return this.client.post<TCreatePipeline>(
      `${this.baseUrl(organizationId)}`,
      payload,
    );
  }

  delete(organizationId: string, id: string) {
    return this.client.delete(`${this.baseUrl(organizationId)}/${id}`);
  }
}

export const pipelinesApi = new PipelinesApi();
