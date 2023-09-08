import { ActionArgs } from "@remix-run/node";
import { actionBuilder } from "~/utils.server";

export async function action(actionArgs: ActionArgs) {
  return actionBuilder({})(actionArgs);
}
