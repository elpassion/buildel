import { redirect } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { CreateInvitationSchema } from '~/api/organization/organization.contracts';
import { OrganizationApi } from '~/api/organization/OrganizationApi';
import { actionBuilder, validationError } from '~/utils.server';
import { withZod } from '~/utils/form';
import { routes } from '~/utils/routes.utils';
import { setServerToast } from '~/utils/toast.server';

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ request, params }, { fetch }) => {
      const validator = withZod(CreateInvitationSchema);
      invariant(params.organizationId, 'organizationId not found');

      const result = await validator.validate(await request.formData());

      if (result.error) return validationError(result.error);

      const organizationApi = new OrganizationApi(fetch);

      const { data } = await organizationApi.createInvitation(
        params.organizationId,
        result.data.invitation,
      );

      return redirect(routes.organizationInvitations(params.organizationId), {
        headers: {
          'Set-Cookie': await setServerToast(request, {
            success: {
              title: 'Member invited',
              description: `You've invited ${data.email} to your organization.`,
            },
          }),
        },
      });
    },
  })(actionArgs);
}
