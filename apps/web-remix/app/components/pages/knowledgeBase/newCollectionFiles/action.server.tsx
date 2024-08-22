import { json } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { OrganizationApi } from '~/api/organization/OrganizationApi';
import { requireLogin } from '~/session.server';
import { actionBuilder } from '~/utils.server';
import { assert } from '~/utils/assert';

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, 'Missing organizationId');

      const formData = await request.formData();
      const url = formData.get('url');

      assert(url, 'Missing url');

      const organizationApi = new OrganizationApi(fetch);

      const pages = await organizationApi.discoverPages(
        params.organizationId,
        url as string,
      );

      return json({ pages: pages.data });
    },
  })(actionArgs);
}
