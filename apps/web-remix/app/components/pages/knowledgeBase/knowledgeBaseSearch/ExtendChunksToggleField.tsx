import React, { forwardRef } from "react";
import { InputText } from "@elpassion/taco";
import { ToggleInputProps } from "~/components/form/inputs/toggle.input";
import { useFieldContext } from "~/components/form/fields/field.context";
import { CheckboxInputField } from "~/components/form/fields/checkbox.field";

export const ExtendChunksField = forwardRef<
  HTMLInputElement,
  Partial<ToggleInputProps>
>(({ label, supportingText, ...props }) => {
  const { error } = useFieldContext();

  return (
    <div>
      <div className="flex gap-2 w-full h-10 items-center justify-start">
        <CheckboxInputField label={label} />
      </div>

      <InputText
        className="!mt-0"
        text={error ?? supportingText}
        error={!!error}
      />
    </div>
  );
});
