import { ISignIn, ISignUp } from '~/contracts/auth.contracts';
import { HttpClient, createHttpClient } from '~/utils';

export class AuthApi {
  public baseUrl = '/auth';
  private client: HttpClient;

  constructor(client: HttpClient = createHttpClient()) {
    this.client = client;
  }

  signIn(data: ISignIn) {
    return this.client.post(`${this.baseUrl}`, data);
  }
  signUp(data: ISignUp) {
    return this.client.post(`${this.baseUrl}`, data);
  }
}
