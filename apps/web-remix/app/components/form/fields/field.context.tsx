import React, { useContext } from 'react';
import { useField } from 'remix-validated-form';
import type { ValidationBehaviorOptions } from 'remix-validated-form/browser/internal/getInputProps';

export function Field({
  children,
  name,
}: {
  children: React.ReactNode;
  name: string;
}) {
  return (
    <FieldContext.Provider value={{ name }}>{children}</FieldContext.Provider>
  );
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
  validationBehavior?: Partial<ValidationBehaviorOptions>;
}

export const useFieldContext = (args?: UseFieldContextProps) => {
  const context = useContext(FieldContext);
  if (!context)
    throw new Error('You tried to use a field without using <Field />');

  const fieldProps = useField(context.name, {
    validationBehavior: args?.validationBehavior ?? { initial: 'onSubmit' },
  });

  return { ...context, ...fieldProps };
};
