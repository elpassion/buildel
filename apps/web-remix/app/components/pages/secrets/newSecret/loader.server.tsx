import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';
import { SecretsApi } from '~/api/secrets/SecretsApi';

import { requireLogin } from '~/session.server';
import { loaderBuilder } from '~/utils.server';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, 'organizationId not found');

    const secretsApi = new SecretsApi(fetch);
    const aliases = await secretsApi.getAliases(params.organizationId)

    return json({ organizationId: params.organizationId, aliases: aliases.data.data });
  })(args);
}
