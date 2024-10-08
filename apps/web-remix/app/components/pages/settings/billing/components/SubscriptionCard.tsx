import React from 'react';
import { Sparkle, Sparkles } from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { Button, ButtonProps } from '~/components/ui/button';
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

export function ManageSubscriptionButton({ className, ...rest }: ButtonProps) {
  return (
    <Button
      size="xs"
      variant="outline"
      className={cn(
        'gap-2 items-center bg-green-500/5 text-green-500 border-green-500/30 hover:text-green-500 hover:bg-green-500/10',
        className,
      )}
      {...rest}
    >
      <span>Manage Subscription</span>
      <Sparkles className="w-3.5 h-3.5" />
    </Button>
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

export function UsageText({
  usage,
  maxUsage,
}: {
  usage: number;
  maxUsage: number;
}) {
  return (
    <p className={cn('text-xs flex gap-1 items-center')}>
      <span className="text-foreground">
        {usage}/{maxUsage}
      </span>
      <span className="text-muted-foreground">runs used</span>
    </p>
  );
}

function UsageBar({ usagePercentage }: { usagePercentage: number }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={usagePercentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Usage progress"
      className="w-full bg-muted rounded-full h-1.5"
    >
      <div
        className="bg-primary h-1.5 rounded-full"
        style={{ width: `${usagePercentage}%` }}
      />
    </div>
  );
}

export function UsageProgress({
  usage,
  maxUsage,
}: {
  usage: number;
  maxUsage: number;
}) {
  const usagePercentage = (usage / maxUsage) * 100;

  return (
    <div>
      <div className="flex justify-end mb-1">
        <UsageText usage={usage} maxUsage={maxUsage} />
      </div>

      <UsageBar usagePercentage={usagePercentage} />
    </div>
  );
}
