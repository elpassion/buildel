import { sha256 } from "js-sha256";
export class BuildelAuth {
  constructor(private readonly secret: string) {}

  generateAuth(
    socketId: string,
    channelName: string,
    userData: Record<string, any> = {}
  ) {
    const userJSON = JSON.stringify(userData);
    const auth = btoa(
      sha256.hmac(
        this.secret,
        this.createAuthMessage(socketId, channelName, userJSON)
      )
    );

    return { auth, user_data: userJSON };
  }

  createAuthMessage(socketId: string, channelName: string, userJSON: string) {
    return `${socketId}::${channelName}::${userJSON}`;
  }
}
