import React, { forwardRef, PropsWithChildren, ReactNode } from "react";
import { useControlField } from "remix-validated-form";
import { Icon, InputText, Label } from "@elpassion/taco";
import { EditorProps } from "@monaco-editor/react";
import {
  HiddenField,
  useFieldContext,
} from "~/components/form/fields/field.context";
import { MonacoEditorInput } from "~/components/editor/MonacoEditorInput";
import { useBoolean } from "usehooks-ts";
import { Modal } from "@elpassion/taco/Modal";
import classNames from "classnames";

type MonacoEditorFieldProps = Partial<
  EditorProps & {
    label: ReactNode;
    supportingText: ReactNode;
    error?: ReactNode;
  }
>;

export const MonacoEditorField = forwardRef<
  HTMLInputElement,
  MonacoEditorFieldProps
>(({ label, defaultValue, error, supportingText, onChange, ...props }) => {
  const { name, getInputProps, validate } = useFieldContext();
  const { value: isShown, setTrue: show, setFalse: hide } = useBoolean(false);
  const [value, setValue] = useControlField<string | undefined>(name);

  const handleOnChange = (v: string | undefined, e: any) => {
    setValue(v);
    validate();
    onChange?.(v, e);
  };

  const currentValue = value ?? defaultValue;

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

      <MonacoEditorInput
        path={name}
        theme="vs-dark"
        height="130px"
        loading={<div className="w-full h-[130px] border border-neutral-200" />}
        value={currentValue}
        onChange={handleOnChange}
        {...props}
      />
      <InputText text={error ?? supportingText} error={!!error} />

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
          error={error}
          onChange={handleOnChange}
          {...props}
        />
      </div>
    </>
  );
});

interface MaximizedEditorProps extends MonacoEditorFieldProps {
  value?: string;
  isOpen: boolean;
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
        <MonacoEditorInput
          path={name + "preview"}
          height="500px"
          loading={
            <div className="w-full h-[500px] border border-neutral-200" />
          }
          value={value}
          onChange={onChange}
          {...rest}
        />

        <InputText text={error ?? supportingText} error={!!error} />
      </div>
    </Modal>
  );
}
