import { json } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';
import { z } from 'zod';

import { OrganizationResponse } from '~/api/organization/organization.contracts';
import { requireLogin } from '~/session.server';
import { actionBuilder } from '~/utils.server';
import { withZod } from '~/utils/form';
import { setServerToast } from '~/utils/toast.server';

import { schema } from './schema';

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ params, request }, { fetch }) => {
      invariant(params.organizationId, 'organizationId not found');
      await requireLogin(request);

      const res = await fetch(
        z.any(),
        `/organizations/${params.organizationId}/api_key`,
        { method: 'POST' },
      );

      return json(
        { key: res.data },
        {
          headers: {
            'Set-Cookie': await setServerToast(request, {
              success: {
                title: 'API Key created',
                description: `You've successfully generated API Key!`,
              },
            }),
          },
        },
      );
    },
    put: async ({ params, request }, { fetch }) => {
      invariant(params.organizationId, 'organizationId not found');
      await requireLogin(request);

      const validator = withZod(schema);

      const result = await validator.validate(await request.formData());

      await fetch(
        OrganizationResponse,
        `/organizations/${params.organizationId}`,
        {
          method: 'PUT',
          body: JSON.stringify(result.data),
        },
      );

      return json(
        {},
        {
          headers: {
            'Set-Cookie': await setServerToast(request, {
              success: {
                title: 'Organization updated',
                description: `You've successfully updated organization name!`,
              },
            }),
          },
        },
      );
    },
  })(actionArgs);
}
