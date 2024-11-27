import React, { useEffect } from 'react';
import type * as RadioGroupPrimitive from '@radix-ui/react-radio-group';

import { useFieldContext } from '~/components/form/fields/field.context';
import { useControlField } from '~/components/form/fields/form.field';
import type { RadioInputProps } from '~/components/form/inputs/radio.input';
import {
  RadioInput,
  RadioTabInput,
} from '~/components/form/inputs/radio.input';
import type { RadioGroupProps } from '~/components/ui/radio-group';
import { RadioGroup } from '~/components/ui/radio-group';

export const RadioField = ({
  ref,
  ...props
}: RadioInputProps & {
  ref?: React.RefObject<HTMLButtonElement | null>;
}) => {
  return <RadioInput {...props} ref={ref} />;
};
RadioField.displayName = 'RadioField';

export const RadioTabField = ({
  ref,
  ...props
}: RadioInputProps & {
  ref?: React.RefObject<HTMLButtonElement | null>;
}) => {
  return <RadioTabInput {...props} ref={ref} />;
};
RadioTabField.displayName = 'RadioTabField';

export const RadioGroupField = ({
  ref,
  defaultValue,
  onChange,
  ...props
}: RadioGroupProps & {
  ref?: React.RefObject<React.ElementRef<
    typeof RadioGroupPrimitive.Root
  > | null>;
}) => {
  const { name, getInputProps, validate } = useFieldContext();
  const [formValue, setFormValue] = useControlField<string>(name());
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
    <RadioGroup
      ref={ref}
      name={name()}
      onChange={onChange}
      onBlur={getInputProps({ type: 'radio' }).onBlur}
      onValueChange={(value) => {
        setFormValue(value);

        validate();
      }}
      {...props}
      value={props.value ?? formValue}
    />
  );
};
RadioGroupField.displayName = 'RadioGroupField';
