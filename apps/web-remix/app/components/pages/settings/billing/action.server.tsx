import type { ActionFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { validationError } from 'remix-validated-form';
import invariant from 'tiny-invariant';

import { SubscriptionsApi } from '~/api/subscriptions/SubscriptionsApi';
import { checkoutSchema } from '~/components/pages/settings/billing/schema';
import { requireLogin } from '~/session.server';
import { actionBuilder } from '~/utils.server';

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async ({ params, request }, { fetch }) => {
      await requireLogin(request);
      invariant(params.organizationId, 'Missing organizationId');

      const validator = withZod(checkoutSchema);

      const result = await validator.validate(await request.formData());

      if (result.error) return validationError(result.error);

      const subscriptionsApi = new SubscriptionsApi(fetch);

      const { data: checkout } = await subscriptionsApi.checkout(
        params.organizationId,
        {
          price_id: result.data.priceId,
        },
      );

      return redirect(checkout.data.url);
    },
  })(actionArgs);
}
