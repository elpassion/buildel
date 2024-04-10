import { json, LoaderFunctionArgs } from "@remix-run/node";
import { requireNotLogin } from "~/session.server";
import { loaderBuilder } from "~/utils.server";
import { AuthApi } from "~/api/auth/AuthApi";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request }, { fetch }) => {
    await requireNotLogin(request);

    const authApi = new AuthApi(fetch);

    const { data } = await authApi.signUpDisabled();

    return json({
      googleLoginEnabled: !!process.env.GOOGLE_CLIENT_ID,
      signupEnabled: !data.registration_disabled,
    });
  })(args);
}
