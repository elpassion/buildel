import React, { forwardRef, PropsWithChildren } from "react";
import {
  Form as RemixForm,
  FormProps as RemixFormProps,
} from "@remix-run/react";
import { conform, useForm } from "@conform-to/react";
import { FormConfig } from "@conform-to/react/hooks";
import { TextInput, TextInputProps } from "~/components/form/inputs/text.input";

interface IFormContext {
  fields: Record<string, any>;
}

const FormContext = React.createContext<IFormContext | null>(null);

interface FormProps<T extends Record<string, any>>
  extends PropsWithChildren,
    Omit<RemixFormProps, "onSubmit" | "defaultValue">,
    FormConfig<T, T> {}
export function Form<T extends Record<string, any>>({
  children,
  ...config
}: FormProps<T>) {
  const [form, fields] = useForm<T>({
    shouldValidate: "onSubmit",
    ...config,
  });
  return (
    <FormContext.Provider value={{ fields }}>
      <RemixForm {...form.props}>{children}</RemixForm>
    </FormContext.Provider>
  );
}

interface BaseField {
  error?: string;
  errors?: string[];
  name: string;
  defaultValue?: any;
}

export function useField({ name }: { name: string }): BaseField {
  const ctx = React.useContext(FormContext);

  if (!ctx) {
    throw new Error("You tried to use a field without using <Form />");
  }

  const field = ctx.fields[name];

  if (!field) {
    throw new Error(`There is no ${name} field in the form`);
  }

  return field;
}

export const SampleTextInputField = forwardRef<
  HTMLInputElement,
  Partial<TextInputProps>
>((props, ref) => {
  const field = useField({ name: props.name! });

  return (
    <TextInput
      {...conform.input(field, {
        type: "text",
      })}
      errorMessage={field.error}
      {...props}
    />
  );
});
