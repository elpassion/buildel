import { OAuth2Client as AuthClient } from 'google-auth-library';

export class OAuth2Client {
  private readonly client: AuthClient;
  private readonly redirectUri: string | undefined;
  constructor(clientId: string, clientSecret: string, redirectUri?: string) {
    this.redirectUri = redirectUri;
    this.client = new AuthClient(clientId, clientSecret, redirectUri);
  }

  generateAuthUrl(state?: string) {
    return this.client.generateAuthUrl({
      prompt: 'select_account',
      redirect_uri: this.redirectUri,
      state,
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'openid',
      ],
    });
  }

  async getToken(code: string) {
    return this.client.getToken(code);
  }
}
