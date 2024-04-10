import { fetchTyped } from "~/utils/fetch.server";
import {
  ISignInSchema,
  ISignUpSchema,
  SignUpDisabledResponse,
  SignUpInvitation,
} from "./auth.contracts";
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

  signUpInvitation(user: z.TypeOf<typeof SignUpInvitation>) {
    return this.client(z.any(), `/users/register/invitation`, {
      method: "POST",
      body: JSON.stringify({ user }),
    });
  }

  signUpDisabled() {
    return this.client(SignUpDisabledResponse, `/users/register`, {
      method: "GET",
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
