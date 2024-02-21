import React, { forwardRef, useRef } from "react";
import classNames from "classnames";
import { Icon } from "@elpassion/taco";
import { TextInput, TextInputProps } from "~/components/form/inputs/text.input";
import { useFieldContext } from "~/components/form/fields/field.context";

export const TextInputField = forwardRef<
  HTMLInputElement,
  Partial<TextInputProps>
>(({ errorMessage, ...props }, ref) => {
  const { name, getInputProps, error } = useFieldContext();
  return (
    <TextInput
      name={name}
      ref={ref}
      aria-invalid={error ? true : undefined}
      aria-describedby={`${name}-error`}
      aria-errormessage={error ? `${name}-error` : undefined}
      aria-label={name}
      autoComplete={name}
      errorMessage={errorMessage ?? error}
      {...props}
      {...getInputProps()}
    />
  );
});

export const PasswordInputField = forwardRef<
  HTMLInputElement,
  Partial<TextInputProps>
>((props, ref) => {
  return <TextInputField ref={ref} type={"password"} {...props} />;
});

export function ResettableTextInputField({
  label,
  ...props
}: Partial<TextInputProps>) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onReset = () => {
    if (inputRef.current) {
      inputRef.current.value = (props.defaultValue ?? "") as string;
    }
  };

  const canReset = !!props.defaultValue;

  return (
    <TextInputField
      ref={inputRef}
      label={
        <div className="flex gap-2 justify-between items-center">
          <span>{label}</span>

          {canReset ? <ResettableFieldResetButton onClick={onReset} /> : null}
        </div>
      }
      {...props}
    />
  );
}

interface ResettableFieldResetButtonProps {
  onClick: () => void;
}

function ResettableFieldResetButton({
  onClick,
}: ResettableFieldResetButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Reset to default value"
      title="Reset to default value"
      className={classNames("text-neutral-200")}
    >
      <Icon iconName="refresh-ccw" />
    </button>
  );
}
