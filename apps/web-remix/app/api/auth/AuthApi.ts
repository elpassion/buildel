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

  resetPassword(email: string) {
    return this.client(z.any(), `/users/password/reset`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  setPassword(params: {
    token: string;
    password: string;
    password_confirmation: string;
  }) {
    return this.client(z.any(), `/users/password/reset`, {
      method: "PUT",
      body: JSON.stringify(params),
    });
  }
}
