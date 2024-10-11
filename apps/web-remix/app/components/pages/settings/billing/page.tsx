import React, { useEffect } from 'react';
import type { MetaFunction } from '@remix-run/node';
import { useLoaderData, useSearchParams } from '@remix-run/react';

import { errorToast } from '~/components/toasts/errorToast';
import { successToast } from '~/components/toasts/successToast';
import { warningToast } from '~/components/toasts/warningToast';
import { metaWithDefaults } from '~/utils/metadata';

import { BillingPlanFilters, BillingPlanList } from './components/BillingPlan';
import { UsageProgress } from './components/BillingProgress';
import {
  ManageSubscriptionButton,
  SubscriptionCard,
  SubscriptionContent,
  SubscriptionCurrentPlan,
  SubscriptionHeader,
  SubscriptionTitle,
} from './components/SubscriptionCard';
import type { loader } from './loader.server';

const TOAST_DURATION = 10000;

export function BillingPage() {
  const { plans } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const result = searchParams.get('result');

    if (!result) return;

    const id = setTimeout(() => {
      if (result === 'success') {
        successToast({
          title: 'Subscription updated successfully',
          duration: TOAST_DURATION,
        });
      } else if (result === 'error') {
        errorToast({
          title: 'Failed to update subscription',
          duration: TOAST_DURATION,
        });
      } else if (result === 'cancel') {
        warningToast({
          title: 'Subscription has been cancelled',
          duration: TOAST_DURATION,
        });
      }
    }, 500);

    searchParams.delete('result');
    setSearchParams(searchParams);

    return () => {
      clearTimeout(id);
    };
  }, [searchParams]);

  return (
    <>
      <SubscriptionCard>
        <SubscriptionHeader>
          <SubscriptionTitle />
          <ManageSubscriptionButton />
        </SubscriptionHeader>

        <SubscriptionContent>
          <SubscriptionCurrentPlan />

          <UsageProgress usage={199} maxUsage={1000} />
        </SubscriptionContent>
      </SubscriptionCard>

      <section className="mt-20">
        <BillingPlanFilters plans={plans}>
          {(filteredPlans) => <BillingPlanList plans={filteredPlans} />}
        </BillingPlanFilters>

        <p className="text-xs mt-6 text-muted-foreground">
          * A run is defined as an execution of a BuildEL workflow.
        </p>
      </section>
    </>
  );
}

export const meta: MetaFunction = metaWithDefaults(() => {
  return [
    {
      title: 'Billing',
    },
  ];
});
