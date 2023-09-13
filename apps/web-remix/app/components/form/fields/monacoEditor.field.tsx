import React, { forwardRef } from "react";
import { useControlField } from "remix-validated-form";
import { useFieldContext } from "~/components/form/fields/field.context";
import {
  MonacoEditor,
  MonacoEditorProps,
} from "~/components/editor/MonacoEditor";

export const MonacoEditorField = forwardRef<
  HTMLInputElement,
  Partial<MonacoEditorProps>
>((props, ref) => {
  const { name, getInputProps, validate } = useFieldContext();
  const [value, setValue] = useControlField<string | undefined>(name);

  return (
    <MonacoEditor
      loading={<div className="w-full h-[20vh] border border-neutral-200" />}
      height="20vh"
      {...getInputProps()}
      value={value}
      onChange={(v) => {
        setValue(v);
        validate();
      }}
      {...props}
    />
  );
});
