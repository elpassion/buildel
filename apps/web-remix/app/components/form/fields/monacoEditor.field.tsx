import React, { forwardRef, ReactNode } from "react";
import { useControlField } from "remix-validated-form";
import {
  HiddenField,
  useFieldContext,
} from "~/components/form/fields/field.context";
import {
  MonacoEditor,
  MonacoEditorProps,
} from "~/components/editor/MonacoEditor";
import { InputText, Label } from "@elpassion/taco";

export const MonacoEditorField = forwardRef<
  HTMLInputElement,
  Partial<MonacoEditorProps & { label: string; supportingText: ReactNode }>
>(({ label, supportingText, ...props }) => {
  const { name, getInputProps, validate } = useFieldContext();
  const [value, setValue] = useControlField<string | undefined>(name);

  return (
    <>
      <HiddenField value={value} {...getInputProps()} />
      <Label text={label} />
      <MonacoEditor
        loading={<div className="w-full h-[20vh] border border-neutral-200" />}
        height="20vh"
        value={value}
        onChange={(v) => {
          setValue(v);
          validate();
        }}
        {...props}
      />
      <InputText type="supportingText" text={supportingText} />
    </>
  );
});
