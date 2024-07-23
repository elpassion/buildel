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

    const searchParams = new URL(request.url).searchParams;

    const organizationApi = new OrganizationApi(fetch);

    const { data: templates } = await organizationApi.getTemplates(
      params.organizationId,
    );
    return json({
      templates,
      organizationId: params.organizationId,
      step: searchParams.get('step') ?? '',
    });
  })(args);
}
