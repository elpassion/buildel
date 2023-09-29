import hmacSHA256 from "crypto-js/hmac-sha256";
import Base64 from "crypto-js/enc-base64";
export class BuildelAuth {
  constructor(private readonly secret: string) {}

  generateAuth(
    socketId: string,
    channelName: string,
    userData: Record<string, any> = {}
  ) {
    const userJSON = JSON.stringify(userData);
    const auth = Base64.stringify(
      hmacSHA256(
        this.createAuthMessage(socketId, channelName, userJSON),
        this.secret
      )
    );

    return { auth, user_data: userJSON };
  }

  createAuthMessage(socketId: string, channelName: string, userJSON: string) {
    return `${socketId}::${channelName}::${userJSON}`;
  }
}
