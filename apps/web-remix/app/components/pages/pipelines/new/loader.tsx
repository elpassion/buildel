import { json, LoaderArgs } from "@remix-run/node";
import { loaderBuilder } from "~/utils.server";

export async function loader(args: LoaderArgs) {
  return loaderBuilder(() => {
    return json({});
  })(args);
}
