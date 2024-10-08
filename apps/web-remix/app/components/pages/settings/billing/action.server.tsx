import type { ActionFunctionArgs } from '@remix-run/node';

import { actionBuilder } from '~/utils.server';

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({})(actionArgs);
}
