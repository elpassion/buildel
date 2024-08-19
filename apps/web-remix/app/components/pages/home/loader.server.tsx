import { redirect } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';

import { OrganizationApi } from '~/api/organization/OrganizationApi';
import { requireLogin } from '~/session.server';
import { loaderBuilder } from '~/utils.server';
import { getCurrentUser } from '~/utils/currentUser.server';
import { routes } from '~/utils/routes.utils';
import { getOrganizationId } from '~/utils/toast.server';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request }, { fetch }) => {
    await requireLogin(request);

    const { user } = await getCurrentUser(request);

    if (user.marketing_agreement === null) {
      throw redirect(routes.agreements);
    }

    const organizationApi = new OrganizationApi(fetch);

    const { data: organizations } = await organizationApi.getOrganizations();

    const organizationId = await getOrganizationId(
      request.headers.get('Cookie') || '',
    );
    const savedOrganizationIndex = organizations.data.findIndex(
      (org) => org.id === organizationId,
    );
    const organization = organizations.data.at(savedOrganizationIndex);

    if (organization) {
      return redirect(routes.pipelines(organization.id));
    } else {
      return redirect(routes.newOrganization());
    }
  })(args);
}
