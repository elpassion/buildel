import React, { PropsWithChildren } from "react";
import { Form as RemixForm } from "@remix-run/react";
import { useForm } from "@conform-to/react";
import { FormConfig } from "@conform-to/react/hooks";

interface IFormContext {
  fields: Record<string, any>;
}

const FormContext = React.createContext<IFormContext | null>(null);

interface FormProps<T extends Record<string, any>>
  extends PropsWithChildren,
    FormConfig<T, T> {}
export function Form<T extends Record<string, any>>({
  children,
  ...config
}: FormProps<T>) {
  const [form, fields] = useForm<T>(config);

  return (
    <FormContext.Provider value={{ fields }}>
      <RemixForm {...form.props}>{children}</RemixForm>
    </FormContext.Provider>
  );
}

export function useField({ name }: { name: string }) {
  const ctx = React.useContext(FormContext);

  if (!ctx) {
    throw new Error("You tried to use a field without using <Form />");
  }
  if (!Object.keys(ctx).includes(name)) {
    throw new Error("Wrong Field Name");
  }

  return ctx.fields[name];
}
