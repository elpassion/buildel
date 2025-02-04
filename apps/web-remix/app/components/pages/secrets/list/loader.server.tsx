import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { SecretsApi } from '~/api/secrets/SecretsApi';
import { getParamsPagination } from '~/components/pagination/usePagination';
import { requireLogin } from '~/session.server';
import { loaderBuilder } from '~/utils.server';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, 'organizationId not found');

    const secretsApi = new SecretsApi(fetch);

    const searchParams = new URL(request.url).searchParams;

    const { search } = getParamsPagination(searchParams);

    const secrets = await secretsApi.getSecrets(params.organizationId, false, {
      search,
    });

    return json({
      organizationId: params.organizationId,
      secrets: secrets.data,
      search,
    });
  })(args);
}
