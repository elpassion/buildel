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

    const invitationsPromise = organizationApi.getInvitations(
      params.organizationId,
    );

    const [invitations] = await Promise.all([invitationsPromise]);

    return json({
      organizationId: params.organizationId,
      invitations: invitations.data,
    });
  })(args);
}
