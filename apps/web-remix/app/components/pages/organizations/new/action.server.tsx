import { redirect } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';

import { CreateOrganizationSchema } from '~/api/organization/organization.contracts';
import { OrganizationApi } from '~/api/organization/OrganizationApi';
import { actionBuilder, validationError } from '~/utils.server';
import { withZod } from '~/utils/form';
import { routes } from '~/utils/routes.utils';

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ request }, { fetch }) => {
      const validator = withZod(CreateOrganizationSchema);

      const result = await validator.validate(await request.formData());

      if (result.error) return validationError(result.error);

      const organizationApi = new OrganizationApi(fetch);

      const response = await organizationApi.createOrganization(result.data);

      throw redirect(routes.organization(response.data.id));
    },
  })(actionArgs);
}
