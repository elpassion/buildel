import React, { forwardRef, ReactNode } from "react";
import { useControlField } from "remix-validated-form";
import { InputText, Label } from "@elpassion/taco";
import {
  HiddenField,
  useFieldContext,
} from "~/components/form/fields/field.context";
import {
  MonacoEditorWithSuggestions,
  MonacoEditorWithSuggestionsProps,
} from "~/components/editor/MonacoEditorWithSuggestions";

export const MonacoSuggestionEditorField = forwardRef<
  HTMLInputElement,
  Partial<
    MonacoEditorWithSuggestionsProps & {
      label: string;
      supportingText: ReactNode;
      error?: string;
    }
  >
>(({ label, error, supportingText, ...props }) => {
  const { name, getInputProps, validate } = useFieldContext();
  const [value, setValue] = useControlField<string | undefined>(name);

  return (
    <>
      <HiddenField value={value} {...getInputProps()} />
      <Label text={label} />
      <MonacoEditorWithSuggestions
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
      <InputText text={error ?? supportingText} error={!!error} />
    </>
  );
});
