import React, { forwardRef, ReactNode } from "react";
import { useControlField } from "remix-validated-form";
import { InputText, Label } from "@elpassion/taco";
import { EditorProps } from "@monaco-editor/react";
import {
  HiddenField,
  useFieldContext,
} from "~/components/form/fields/field.context";
import { MonacoEditorInput } from "~/components/editor/MonacoEditorInput";

export const MonacoEditorField = forwardRef<
  HTMLInputElement,
  Partial<
    EditorProps & {
      label: ReactNode;
      supportingText: ReactNode;
      error?: ReactNode;
    }
  >
>(({ label, error, supportingText, onChange, ...props }) => {
  const { name, getInputProps, validate } = useFieldContext();
  const [value, setValue] = useControlField<string | undefined>(name);

  return (
    <>
      <HiddenField value={value} {...getInputProps()} />
      <Label text={label} />
      <MonacoEditorInput
        path={name}
        theme="vs-dark"
        height="130px"
        loading={<div className="w-full h-[130px] border border-neutral-200" />}
        value={value}
        onChange={(v, e) => {
          setValue(v);
          validate();
          onChange?.(v, e);
        }}
        {...props}
      />
      <InputText text={error ?? supportingText} error={!!error} />
    </>
  );
});
