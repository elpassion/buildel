import type { ReactNode } from 'react';
import React, { forwardRef } from 'react';

import { useFieldContext } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { ToggleInputField } from '~/components/form/fields/toggle.field';
import type { ToggleInputProps } from '~/components/form/inputs/toggle.input';

export type LogsToggleFieldProps = Partial<ToggleInputProps> & {
  label: ReactNode;
  supportingText: ReactNode;
};

export const LogsToggleField = forwardRef<
  HTMLInputElement,
  LogsToggleFieldProps
>(({ label, supportingText, ...props }) => {
  const { error } = useFieldContext();

  return (
    <div>
      <div
        className="flex gap-2 items-center mb-1"
        onClick={(e) => e.preventDefault()}
      >
        <FieldLabel className="mb-0">{label}</FieldLabel>
        <ToggleInputField size="sm" {...props} />
      </div>

      <FieldMessage className="!mt-0" error={error()}>
        {supportingText}
      </FieldMessage>
    </div>
  );
});
LogsToggleField.displayName = 'LogsToggleField';
