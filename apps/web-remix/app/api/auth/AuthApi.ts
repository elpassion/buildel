import { fetchTyped } from "~/utils/fetch.server";
import { ISignInSchema, ISignUpSchema } from "./auth.contracts";
import z from "zod";

export class AuthApi {
  constructor(private client: typeof fetchTyped) {}

  signIn(user: ISignInSchema["user"]) {
    return this.client(z.any(), `/users/log_in`, {
      method: "POST",
      body: JSON.stringify({ user }),
    });
  }

  signUp(user: ISignUpSchema["user"]) {
    return this.client(z.any(), `/users/register`, {
      method: "POST",
      body: JSON.stringify({ user }),
    });
  }
}
