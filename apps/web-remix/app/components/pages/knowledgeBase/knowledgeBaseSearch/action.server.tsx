import { json } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';

import { actionBuilder } from '~/utils.server';

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async () => {
      return json({});
    },
  })(actionArgs);
}
