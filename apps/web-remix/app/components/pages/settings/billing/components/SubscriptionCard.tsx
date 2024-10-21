import React, { useMemo } from 'react';
import { withZod } from '@remix-validated-form/with-zod';
import { Sparkles } from 'lucide-react';
import { ValidatedForm } from 'remix-validated-form';

import { HiddenField } from '~/components/form/fields/field.context';
import { SubmitButton } from '~/components/form/submit';
import { portalSchema } from '~/components/pages/settings/billing/schema';
import { Badge } from '~/components/ui/badge';
import type { ButtonProps } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { cn } from '~/utils/cn';

export interface SubscriptionCardProps {
  usage: number;
  maxUsage: number;
}

export function SubscriptionCard({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Card className={cn('hover:border-input', className)} {...rest}>
      {children}
    </Card>
  );
}

export function SubscriptionTitle() {
  return (
    <CardTitle className={cn('group-hover:text-foreground')}>
      Subscription Details
    </CardTitle>
  );
}

export function ManageSubscriptionButton({
  className,
  customerId,
  ...rest
}: ButtonProps & { customerId: string | null }) {
  const validator = useMemo(() => withZod(portalSchema), []);
  return (
    <ValidatedForm method="POST" validator={validator} noValidate>
      <HiddenField name="customerId" value={customerId || ""} />
      <HiddenField name="intent" value="PORTAL" />

      <SubmitButton
        size="xs"
        variant="outline"
        className={cn(
          'gap-2 items-center bg-green-500/5 text-green-500 border-green-500/10 hover:text-green-500 hover:bg-green-500/10',
          className,
        )}
        {...rest}
      >
        <span>Manage Subscription</span>
        <Sparkles className="w-3.5 h-3.5" />
      </SubmitButton>
    </ValidatedForm>
  );
}

export function SubscriptionHeader({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <CardHeader
      className={cn(
        'flex justify-between border-b border-border p-5 space-y-2 sm:flex-row sm:items-center sm:space-y-0',
        className,
      )}
      {...rest}
    >
      {children}
    </CardHeader>
  );
}

export function SubscriptionContent({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <CardContent className={cn('p-5', className)} {...rest}>
      {children}
    </CardContent>
  );
}

export function PlanDescription() {
  return <CardDescription>Current Plan</CardDescription>;
}

export function PlanType() {
  return <Badge variant="secondary">Free</Badge>;
}

export function SubscriptionCurrentPlan() {
  return (
    <div className="flex gap-2 items-center mb-2">
      <PlanDescription />
      <PlanType />
    </div>
  );
}
