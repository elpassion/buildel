import React, { forwardRef, useEffect } from 'react';
import { useControlField } from 'remix-validated-form';

import { useFieldContext } from '~/components/form/fields/field.context';
import type { RadioInputProps } from '~/components/form/inputs/radio.input';
import { RadioInput } from '~/components/form/inputs/radio.input';

export const RadioField = forwardRef<HTMLInputElement, RadioInputProps>(
  ({ defaultValue, onChange, ...props }, ref) => {
    const { name, getInputProps, validate } = useFieldContext();
    const [formValue, setFormValue] = useControlField<string>(name);

    useEffect(() => {
      if (!formValue && defaultValue) {
        setFormValue(defaultValue as string);

        const validateRadio = async () => {
          try {
            // async to prevent errors in tests
            await validate();
          } catch {}
        };

        validateRadio();
      }
    }, [defaultValue, formValue, setFormValue, validate]);

    return (
      <RadioInput
        {...props}
        {...getInputProps({ type: 'radio', id: props.id })}
        ref={ref}
        checked={formValue === props.value}
        onChange={(e) => {
          setFormValue(e.target.value);
          validate();
          onChange?.(e);
        }}
      />
    );
  },
);
