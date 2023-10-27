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
        path={name}
        height="130px"
        loading={<div className="w-full h-[130px] border border-neutral-200" />}
        value={value}
        onChange={(v) => {
          setValue(v);
          validate();
        }}
        {...props}
      />
      <InputText text={supportingText} />
    </>
  );
});
