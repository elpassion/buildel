import React, { use, useMemo } from 'react';

import type { ValidationBehaviorOptions } from '~/components/form/fields/form.field';
import { useField } from '~/components/form/fields/form.field';

export function Field({
  children,
  name,
}: {
  children: React.ReactNode;
  name: string;
}) {
  return <FieldContext value={{ name }}>{children}</FieldContext>;
}

export function HiddenField({
  name,
  value,
}: {
  name: string;
  value?: number | string | string[];
}) {
  return <input type="hidden" name={name} aria-label={name} value={value} />;
}

export const FieldContext = React.createContext<{
  name: string;
  error?: string[] | null;
} | null>(null);

export interface UseFieldContextProps {
  validationBehavior?: ValidationBehaviorOptions;
}

export const useFieldContext = (args?: UseFieldContextProps) => {
  const context = use(FieldContext);
  if (!context)
    throw new Error('You tried to use a field without using <Field />');
  const fieldProps = useField(context.name, {
    validationBehavior: args?.validationBehavior,
  });

  return useMemo(
    () => ({
      ...context,
      ...fieldProps,
      name: fieldProps.name(),
      error: fieldProps.error(),
    }),
    [context, fieldProps],
  );
};
