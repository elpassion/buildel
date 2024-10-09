import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { metaWithDefaults } from '~/utils/metadata';

import { BillingPlanList } from './components/BillingPlan';
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

export function ProfileSettingsPage() {
  const { user, plans } = useLoaderData<typeof loader>();

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
        <h1 className="text-4xl font-semibold mb-10">
          Choose a plan that’s right for you!
        </h1>

        <BillingPlanList plans={plans} />

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
