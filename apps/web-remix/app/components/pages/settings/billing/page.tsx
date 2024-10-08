import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { metaWithDefaults } from '~/utils/metadata';

import {
  ManageSubscriptionButton,
  SubscriptionCard,
  SubscriptionContent,
  SubscriptionCurrentPlan,
  SubscriptionHeader,
  SubscriptionTitle,
  UsageProgress,
} from './components/SubscriptionDetailsCard';
import type { loader } from './loader.server';

export function ProfileSettingsPage() {
  const { user } = useLoaderData<typeof loader>();

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
