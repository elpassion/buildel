import React from 'react';
import { useControlField } from 'remix-validated-form';

import {
  HiddenField,
  useFieldContext,
} from '~/components/form/fields/field.context';
import { EditorInput } from '~/components/form/inputs/editor.input';

export function DatasetRowEditorField() {
  const { name, getInputProps, validate } = useFieldContext();
  const [value, setValue] = useControlField<string | undefined>(name);

  const handleOnChange = (v: string | undefined) => {
    setValue(v);
    validate();
  };

  const currentValue = value;

  return (
    <>
      <HiddenField value={currentValue ?? ''} {...getInputProps()} />
      <EditorInput
        height="200px"
        language="json"
        value={currentValue}
        onChange={handleOnChange}
      />
    </>
  );
}
