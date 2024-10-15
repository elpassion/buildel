import React, { forwardRef, useEffect, useRef } from 'react';
import { RefreshCcw } from 'lucide-react';
import { useControlField } from 'remix-validated-form';
import type { ValidationBehaviorOptions } from 'remix-validated-form/browser/internal/getInputProps';

import { useFieldContext } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import type { TextInputProps } from '~/components/form/inputs/text.input';
import { TextInput } from '~/components/form/inputs/text.input';
import { IconButton } from '~/components/iconButton';

export interface TextInputFieldProps extends TextInputProps {}

export const TextInputField = forwardRef<
  HTMLInputElement,
  Partial<TextInputFieldProps> & {
    validationBehavior?: Partial<ValidationBehaviorOptions>;
  }
>(({ validationBehavior, ...props }, ref) => {
  const { name, getInputProps, error } = useFieldContext({
    validationBehavior,
  });

  return (
    <TextInput
      id={name}
      name={name}
      ref={ref}
      aria-invalid={error ? true : undefined}
      aria-describedby={`${name}-error`}
      aria-errormessage={error ? `${name}-error` : undefined}
      aria-label={name}
      autoComplete={name}
      {...getInputProps()}
      {...props}
    />
  );
});
TextInputField.displayName = 'TextInputField';

export const PasswordInputField = forwardRef<
  HTMLInputElement,
  Partial<TextInputFieldProps>
>((props, ref) => {
  return <TextInputField ref={ref} type={'password'} {...props} />;
});

PasswordInputField.displayName = 'PasswordInputField';

export function ResettableTextInputField({
  label,
  defaultValue,
  ...props
}: Partial<TextInputFieldProps> & { label: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { name } = useFieldContext({
    validationBehavior: {
      initial: 'onChange',
      whenTouched: 'onChange',
      whenSubmitted: 'onChange',
    },
  });

  const [value, setValue] = useControlField<string | undefined>(name);

  useEffect(() => {
    if (typeof defaultValue === 'string') {
      updateAndValidate(defaultValue);
    }
  }, [defaultValue]);

  const onReset = () => {
    if (typeof defaultValue === 'string') {
      updateAndValidate(defaultValue);
    }
  };

  const updateAndValidate = (newValue: string) => {
    setValue(newValue);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const canReset = !!defaultValue && !props.readOnly && !props.disabled;

  return (
    <>
      <FieldLabel>
        <div className="flex gap-2 justify-between items-center">
          <span>{label}</span>

          {canReset ? <ResettableFieldResetButton onClick={onReset} /> : null}
        </div>
      </FieldLabel>
      <TextInputField
        ref={inputRef}
        onChange={onChange}
        value={value}
        {...props}
      />
    </>
  );
}

interface ResettableFieldResetButtonProps {
  onClick: () => void;
}

function ResettableFieldResetButton({
  onClick,
}: ResettableFieldResetButtonProps) {
  return (
    <IconButton
      variant="ghost"
      size="xxs"
      type="button"
      onClick={onClick}
      aria-label="Reset to default value"
      title="Reset to default value"
      icon={<RefreshCcw />}
    />
  );
}
