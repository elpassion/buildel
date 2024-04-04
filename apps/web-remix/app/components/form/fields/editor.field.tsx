import React, { forwardRef, PropsWithChildren, ReactNode } from "react";
import classNames from "classnames";
import { useBoolean } from "usehooks-ts";
import { useControlField } from "remix-validated-form";
import { Modal } from "@elpassion/taco/Modal";
import { Icon, InputText, Label } from "@elpassion/taco";
import {
  HiddenField,
  useFieldContext,
} from "~/components/form/fields/field.context";
import {
  EditorInputProps,
  EditorInput,
} from "~/components/form/inputs/editor.input";

type EditorFieldProps = Partial<
  EditorInputProps & {
    label: ReactNode;
    supportingText: ReactNode;
    error?: ReactNode;
    defaultValue?: string;
  }
>;

export const EditorField = forwardRef<HTMLInputElement, EditorFieldProps>(
  ({
    label,
    defaultValue,
    error: propsError,
    supportingText,
    onChange,
    ...props
  }) => {
    const { name, getInputProps, validate, error } = useFieldContext();
    const { value: isShown, setTrue: show, setFalse: hide } = useBoolean(false);
    const [value, setValue] = useControlField<string | undefined>(name);

    const handleOnChange = (v: string | undefined) => {
      setValue(v);
      validate();
      onChange?.(v);
    };

    const currentValue = value ?? defaultValue ?? "";

    const currentError = propsError ?? error;

    return (
      <>
        <HiddenField value={currentValue} {...getInputProps()} />
        <div className="flex justify-between items-center">
          <Label text={label} />

          <button
            type="button"
            onClick={show}
            className="text-neutral-100 text-sm"
          >
            <Icon iconName="maximize-2" />
          </button>
        </div>
        <EditorInput
          value={currentValue}
          onChange={handleOnChange}
          height="130px"
          id={`${name}-editor`}
          {...props}
        />

        <InputText
          text={currentError ?? supportingText}
          error={!!currentError}
        />

        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <MaximizedEditor
            label={label}
            supportingText={supportingText}
            value={currentValue}
            isOpen={isShown}
            close={hide}
            error={currentError}
            onChange={handleOnChange}
            {...props}
          />
        </div>
      </>
    );
  }
);

interface MaximizedEditorProps extends Omit<EditorFieldProps, "onChange"> {
  value?: string;
  isOpen: boolean;
  onChange: (value?: string) => void;
  close: () => void;
}

function MaximizedEditor({
  children,
  value,
  isOpen,
  close,
  error,
  label,
  supportingText,
  onChange,
  ...rest
}: PropsWithChildren<MaximizedEditorProps>) {
  const { name } = useFieldContext();

  return (
    <Modal
      header={
        <header>
          {label && <h3 className="text-white font-medium text-xl">{label}</h3>}
          {supportingText && (
            <p className="text-white text-sm">{supportingText}</p>
          )}
        </header>
      }
      closeButtonProps={{ iconName: "minimize-2", "aria-label": "Close" }}
      className={classNames("max-w-[900px] w-full min-w-[300px] mx-2")}
      onClose={close}
      isOpen={isOpen}
    >
      <div className="p-2">
        <EditorInput
          id={`${name}-editor`}
          value={value}
          onChange={onChange}
          height="500px"
          {...rest}
        />

        <InputText text={error ?? supportingText} error={!!error} />
      </div>
    </Modal>
  );
}
