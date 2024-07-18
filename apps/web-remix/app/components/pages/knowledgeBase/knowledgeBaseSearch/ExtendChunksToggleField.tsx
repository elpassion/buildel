import type { ReactNode } from 'react';
import React, { forwardRef } from 'react';

import { CheckboxInputField } from '~/components/form/fields/checkbox.field';
import { useFieldContext } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';

export const ExtendChunksField = forwardRef<
  HTMLInputElement,
  { label: ReactNode; supportingText: ReactNode }
>(({ label, supportingText }) => {
  const { error } = useFieldContext();

  return (
    <div>
      <div className="flex gap-2 w-full h-10 items-center justify-start">
        <CheckboxInputField />
        <FieldLabel className="mb-0">{label}</FieldLabel>
      </div>

      <FieldMessage className="!mt-0" error={error}>
        {supportingText}
      </FieldMessage>
    </div>
  );
});
ExtendChunksField.displayName = 'ExtendChunksField';
