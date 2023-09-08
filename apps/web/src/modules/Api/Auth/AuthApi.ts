import { ISignIn, ISignUp, TUser } from '~/contracts/auth.contracts';
import { HttpClient, createHttpClient } from '~/utils';

export class AuthApi {
  public baseUrl = '/users';
  private client: HttpClient;

  constructor(client: HttpClient = createHttpClient()) {
    this.client = client;
  }

  signIn(data: ISignIn) {
    return this.client.post(`${this.baseUrl}/log_in`, { user: data });
  }
  signUp(data: ISignUp) {
    return this.client.post(`${this.baseUrl}/register`, { user: data });
  }
  me() {
    return this.client.get<{ data: TUser }>(`${this.baseUrl}/me`);
  }
}

export const authApi = new AuthApi();
