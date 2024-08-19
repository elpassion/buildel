import React from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { cn } from '~/utils/cn';

interface ExperimentCardProps {
  data: {
    name: string;
    id: string | number;
  };
}

export const DatasetCard = ({
  data,
  className,
  ...rest
}: ExperimentCardProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>) => {
  return (
    <Card className={cn('h-full flex flex-col', className)} {...rest}>
      <CardHeader>
        <CardTitle>Dataset</CardTitle>
        <CardDescription>The dataset used for the experiment.</CardDescription>
      </CardHeader>

      <CardContent className="grow flex flex-col justify-end">
        <CardParagraph title={data.name}>
          ID: <CardParagraphAccent>{data.id}</CardParagraphAccent>
        </CardParagraph>
        <CardParagraph title={data.name}>
          Name: <CardParagraphAccent>{data.name}</CardParagraphAccent>
        </CardParagraph>
      </CardContent>
    </Card>
  );
};

export const WorkflowCard = ({
  data,
  className,
  ...rest
}: ExperimentCardProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>) => {
  return (
    <Card className={cn('h-full flex flex-col', className)} {...rest}>
      <CardHeader>
        <CardTitle>Workflow</CardTitle>
        <CardDescription>The pipeline used for the experiment.</CardDescription>
      </CardHeader>

      <CardContent className="grow flex flex-col justify-end">
        <CardParagraph title={data.name}>
          ID: <CardParagraphAccent>{data.id}</CardParagraphAccent>
        </CardParagraph>
        <CardParagraph title={data.name}>
          Name: <CardParagraphAccent>{data.name}</CardParagraphAccent>
        </CardParagraph>
      </CardContent>
    </Card>
  );
};

export function CardParagraph({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('line-clamp-1 text-sm text-muted-foreground', className)}
      {...rest}
    >
      {children}
    </p>
  );
}

export function CardParagraphAccent({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn('text-foreground', className)} {...rest}>
      {children}
    </span>
  );
}
