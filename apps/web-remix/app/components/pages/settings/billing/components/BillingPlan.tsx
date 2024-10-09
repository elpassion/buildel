import React, { useMemo } from 'react';
import { Dot } from 'lucide-react';

import { stripePrice } from '~/api/subscriptions/subscriptions.contracts';
import type {
  ISubscriptionFeature,
  ISubscriptionPrice,
  ISubscriptionProduct,
} from '~/api/subscriptions/subscriptions.types';
import { ToggleInput } from '~/components/form/inputs/toggle.input';
import { ItemList } from '~/components/list/ItemList';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { cn } from '~/utils/cn';

interface BillingPlan extends ISubscriptionProduct {
  defaultPrice: ISubscriptionPrice;
}

interface BillingPlanFiltersProps {
  plans: ISubscriptionProduct[];
  children: (plans: BillingPlan[]) => React.ReactNode;
}

export function BillingPlanFilters({
  plans,
  children,
}: BillingPlanFiltersProps) {
  const [isYearly, setIsYearly] = React.useState(true);

  const recurringPlans = useMemo(() => {
    return plans.reduce((acc, plan) => {
      const yearly = plan.prices.find(
        (price) => price.recurring?.interval === 'year',
      );
      const monthly = plan.prices.find(
        (price) => price.recurring?.interval === 'month',
      );

      if (!yearly || !monthly) {
        return acc;
      } else {
        return [...acc, { ...plan, defaultPrice: isYearly ? yearly : monthly }];
      }
    }, [] as BillingPlan[]);
  }, [plans, isYearly]);

  return (
    <>
      <div className="flex flex-col items-center text-center mb-10 md:mb-16">
        <h1 className="text-4xl font-semibold mb-6">
          Choose a plan that’s right for you!
        </h1>

        <Label className="flex gap-2 items-center">
          <span>Monthly</span>
          <ToggleInput checked={isYearly} onCheckedChange={setIsYearly} />
          <span>Yearly</span>
          <span className="italic text-xs text-green-500 mt-0.5 font-normal">
            Save with yearly
          </span>
        </Label>
      </div>

      {children(recurringPlans)}
    </>
  );
}

interface BillingPlanListProps {
  plans: BillingPlan[];
}

export function BillingPlanList({ plans }: BillingPlanListProps) {
  return (
    <ItemList
      className="gap-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
      items={plans}
      renderItem={(item) => <BillingPlanListItem data={item} />}
    />
  );
}

type BillingPlanListItemProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  data: BillingPlan;
};

function BillingPlanListItem({
  data,
  className,
  ...rest
}: BillingPlanListItemProps) {
  const { recommended } = data.metadata;

  return (
    <article
      className={cn(
        'relative rounded-lg border p-4 grow min-h-[600px] overflow-hidden',
        { 'border-primary': recommended, 'border-input': !recommended },
        className,
      )}
      {...rest}
    >
      {recommended ? (
        <div className="absolute top-0 right-0 bg-primary text-white text-sm px-3 py-1 rounded-bl-lg">
          Most popular
        </div>
      ) : null}

      <div className="h-[100px]">
        <h3
          className={cn('text-base', {
            'font-semibold': recommended,
            'font-normal': !recommended,
          })}
        >
          {data.name}
        </h3>
      </div>

      <p className="mb-2">
        <span className="text-4xl font-bold">
          {stripePrice(data.defaultPrice).format({ maximumFractionDigits: 0 })}
        </span>
        <span className="text-muted-foreground text-sm">/month</span>
      </p>

      <p className="text-sm text-muted-foreground line-clamp-2 h-10 mb-6">
        {data.description}
      </p>

      <Button
        isFluid
        size="sm"
        variant={recommended ? 'default' : 'outline'}
        className="mb-10"
      >
        Subscribe
      </Button>

      <ItemList
        className="flex flex-col gap-2"
        items={data.features.map((item, index) => ({ ...item, id: index }))}
        renderItem={(item) => <BillingPlanItemFeature data={item} />}
      />
    </article>
  );
}

interface BillingPlanItemFeatureProps {
  data: ISubscriptionFeature;
}

function BillingPlanItemFeature({ data }: BillingPlanItemFeatureProps) {
  return (
    <p className="flex gap-2 items-center text-muted-foreground text-sm">
      <Dot className="text-gray-300" /> <span>{data.name}</span>
    </p>
  );
}
