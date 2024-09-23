import type { ActionFunctionArgs } from '@remix-run/node';

import { interfacePatchAction } from '~/components/pages/pipelines/interface/interface.action.server';
import { requireLogin } from '~/session.server';
import { actionBuilder } from '~/utils.server';

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    // @ts-ignore
    patch: async ({ request, ...rest }, helpers) => {
      await requireLogin(request);

      return interfacePatchAction({ request, ...rest }, helpers);
    },
  })(actionArgs);
}
