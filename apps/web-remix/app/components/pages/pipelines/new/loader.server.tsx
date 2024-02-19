import { json, LoaderFunctionArgs } from "@remix-run/node";
import { loaderBuilder } from "~/utils.server";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(() => {
    return json({});
  })(args);
}
