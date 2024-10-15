import type { ActionFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { validationError } from 'remix-validated-form';
import invariant from 'tiny-invariant';

import { SubscriptionsApi } from '~/api/subscriptions/SubscriptionsApi';
import {
  checkoutSchema,
  portalSchema,
} from '~/components/pages/settings/billing/schema';
import { requireLogin } from '~/session.server';
import type { ActionFunctionHelpers } from '~/utils.server';
import { actionBuilder } from '~/utils.server';

export async function action(actionArgs: ActionFunctionArgs) {
  return actionBuilder({
    post: async (args, helpers) => {
      await requireLogin(args.request);

      const formData = await args.request.clone().formData();

      if (formData.get('intent') === 'CHECKOUT') {
        return checkoutAction(args, helpers);
      } else if (formData.get('intent') === 'PORTAL') {
        return portalAction(args, helpers);
      }

      return json(null, { status: 404 });
    },
  })(actionArgs);
}

async function checkoutAction(
  { params, request }: ActionFunctionArgs,
  { fetch }: ActionFunctionHelpers,
) {
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
}

async function portalAction(
  { params, request }: ActionFunctionArgs,
  { fetch }: ActionFunctionHelpers,
) {
  invariant(params.organizationId, 'Missing organizationId');

  const validator = withZod(portalSchema);

  const result = await validator.validate(await request.formData());

  if (result.error) return validationError(result.error);

  const subscriptionsApi = new SubscriptionsApi(fetch);

  const { data: portal } = await subscriptionsApi.portal(
    params.organizationId,
    {
      customer_id: result.data.customerId,
    },
  );

  return redirect(portal.data.url);
}
