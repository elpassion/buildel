import React from 'react';

import type { ISubscription } from '~/api/subscriptions/subscriptions.types';

interface CurrentSubscriptionPlanContextProps {
  plan: ISubscription;
}

export const CurrentSubscriptionPlanContext =
  React.createContext<CurrentSubscriptionPlanContextProps | null>(null);

export const useCurrentPlan = () => {
  const context = React.useContext(CurrentSubscriptionPlanContext);

  if (!context) {
    throw new Error(
      'useCurrentPlan must be used within a CurrentSubscriptionPlanProvider',
    );
  }

  return context;
};
