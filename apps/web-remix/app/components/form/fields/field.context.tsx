import React, { useContext } from "react";
import { useField } from "remix-validated-form";

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

export const FieldContext = React.createContext<{
  name: string;
  error?: string[] | null;
} | null>(null);

export const useFieldContext = () => {
  const context = useContext(FieldContext);
  if (!context)
    throw new Error("You tried to use a field without using <Field />");
  const fieldProps = useField(context.name);
  return { ...context, ...fieldProps };
};
