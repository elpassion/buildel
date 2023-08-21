import { TApp, TCreateApp } from '~/contracts';
import { HttpClient, createHttpClient } from '~/utils';

export class AppsApi {
  public baseUrl = `/pipelines`;
  private client: HttpClient;

  constructor(client: HttpClient = createHttpClient()) {
    this.client = client;
  }

  // TODO (hub33k): return from backend just array?
  //   how to type this?
  getAll() {
    return this.client.get<{ data: TApp[] }>(`${this.baseUrl}`);
  }

  get(id: string) {
    return this.client.get<TApp>(`${this.baseUrl}/${id}`);
  }

  create(payload: TCreateApp) {
    return this.client.post<TCreateApp>(`${this.baseUrl}`, payload);
  }
}
