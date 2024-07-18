import type { PropsWithChildren, ReactNode } from 'react';
import React, { forwardRef } from 'react';
import { Modal } from '@elpassion/taco/Modal';
import classNames from 'classnames';
import { Maximize2 } from 'lucide-react';
import { useControlField } from 'remix-validated-form';
import { useBoolean } from 'usehooks-ts';

import {
  HiddenField,
  useFieldContext,
} from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import type { EditorInputProps } from '~/components/form/inputs/editor.input';
import { EditorInput } from '~/components/form/inputs/editor.input';
import { IconButton } from '~/components/iconButton';

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

    const currentValue = value ?? defaultValue ?? '';

    const currentError = propsError ?? error;

    return (
      <>
        <HiddenField value={currentValue} {...getInputProps()} />
        <div className="flex justify-between items-center">
          <FieldLabel>{label}</FieldLabel>

          <IconButton
            size="xxs"
            onlyIcon
            icon={<Maximize2 />}
            type="button"
            onClick={show}
          />
        </div>
        <EditorInput
          value={currentValue}
          onChange={handleOnChange}
          height="130px"
          id={`${name}-editor`}
          {...props}
        />

        <FieldMessage error={currentError}>{supportingText}</FieldMessage>

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
  },
);
EditorField.displayName = 'EditorField';
interface MaximizedEditorProps extends Omit<EditorFieldProps, 'onChange'> {
  value?: string;
  isOpen: boolean;
  onChange: (value?: string) => void;
  close: () => void;
}

function MaximizedEditor({
  children: _,
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
      closeButtonProps={{ iconName: 'minimize-2', 'aria-label': 'Close' }}
      className={classNames('max-w-[900px] w-full min-w-[300px] mx-2')}
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

        <FieldMessage error={error}>{supportingText}</FieldMessage>
      </div>
    </Modal>
  );
}
