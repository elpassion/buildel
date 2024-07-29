import React, { forwardRef, useRef } from 'react';
import { RefreshCcw } from 'lucide-react';
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
      {...props}
      {...getInputProps()}
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
  ...props
}: Partial<TextInputFieldProps> & { label: string }) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onReset = () => {
    if (inputRef.current) {
      inputRef.current.value = (props.defaultValue ?? '') as string;
    }
  };

  const canReset = !!props.defaultValue;

  return (
    <>
      <FieldLabel>
        <div className="flex gap-2 justify-between items-center">
          <span>{label}</span>

          {canReset ? <ResettableFieldResetButton onClick={onReset} /> : null}
        </div>
      </FieldLabel>
      <TextInputField ref={inputRef} {...props} />
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
