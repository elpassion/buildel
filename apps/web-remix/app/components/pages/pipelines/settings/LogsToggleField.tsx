import React, { forwardRef } from "react";
import { InputText, Label } from "@elpassion/taco";
import { ToggleInputProps } from "~/components/form/inputs/toggle.input";
import { useFieldContext } from "~/components/form/fields/field.context";
import { ToggleInputField } from "~/components/form/fields/toggle.field";

export const LogsToggleField = forwardRef<
  HTMLInputElement,
  Partial<ToggleInputProps>
>(({ label, supportingText, ...props }) => {
  const { error } = useFieldContext();

  return (
    <div>
      <div className="flex gap-2" onClick={(e) => e.preventDefault()}>
        <Label text={label} />
        <ToggleInputField {...props} />
      </div>

      <InputText
        className="!mt-0"
        text={error ?? supportingText}
        error={!!error}
      />
    </div>
  );
});
