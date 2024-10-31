import React, { useEffect, useRef } from 'react';
import { RefreshCcw } from 'lucide-react';
import { useControlField } from 'remix-validated-form';
import type { ValidationBehaviorOptions } from 'remix-validated-form/browser/internal/getInputProps';

import { useFieldContext } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import type { TextInputProps } from '~/components/form/inputs/text.input';
import { TextInput } from '~/components/form/inputs/text.input';
import { IconButton } from '~/components/iconButton';

export interface TextInputFieldProps extends TextInputProps {}

export const TextInputField = ({
  ref,
  validationBehavior,
  ...props
}: Partial<TextInputFieldProps> & {
  validationBehavior?: Partial<ValidationBehaviorOptions>;
  ref?: React.RefObject<HTMLInputElement | null>;
}) => {
  const { name, getInputProps, error } = useFieldContext({
    validationBehavior,
  });

  return (
    <TextInput
      id={name}
      name={name}
      // @ts-ignore
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
};
TextInputField.displayName = 'TextInputField';

export const PasswordInputField = ({
  ref,
  ...props
}: Partial<TextInputFieldProps> & {
  ref?: React.RefObject<HTMLInputElement>;
}) => {
  return <TextInputField ref={ref} type={'password'} {...props} />;
};

PasswordInputField.displayName = 'PasswordInputField';

export function ResettableTextInputField({
  label,
  defaultValue,
  size,
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
      <FieldLabel size={size}>
        <div className="flex gap-2 justify-between items-center">
          <span>{label}</span>

          {canReset ? <ResettableFieldResetButton onClick={onReset} /> : null}
        </div>
      </FieldLabel>

      <TextInputField
        ref={inputRef}
        onChange={onChange}
        value={value}
        size={size}
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
