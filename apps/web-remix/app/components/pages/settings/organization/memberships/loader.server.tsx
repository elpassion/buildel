import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { OrganizationApi } from '~/api/organization/OrganizationApi';
import { requireLogin } from '~/session.server';
import { loaderBuilder } from '~/utils.server';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, 'organizationId not found');

    const organizationApi = new OrganizationApi(fetch);

    const membershipsPromise = organizationApi.getMemberships(
      params.organizationId,
    );

    const [memberships] = await Promise.all([membershipsPromise]);

    return json({
      organizationId: params.organizationId,
      memberships: memberships.data,
    });
  })(args);
}
