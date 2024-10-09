import React from 'react';
import { Sparkles } from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import type { ButtonProps } from '~/components/ui/button';
import { Button } from '~/components/ui/button';
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
        'gap-2 items-center bg-green-500/5 text-green-500 border-green-500/10 hover:text-green-500 hover:bg-green-500/10',
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
