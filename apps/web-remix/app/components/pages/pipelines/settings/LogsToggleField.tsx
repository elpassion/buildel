import React, { forwardRef } from 'react';
import { InputText, Label } from '@elpassion/taco';

import { useFieldContext } from '~/components/form/fields/field.context';
import { ToggleInputField } from '~/components/form/fields/toggle.field';
import type { ToggleInputProps } from '~/components/form/inputs/toggle.input';

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
LogsToggleField.displayName = 'LogsToggleField';
