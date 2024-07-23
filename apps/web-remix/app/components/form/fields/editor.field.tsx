import type { PropsWithChildren, ReactNode } from 'react';
import React, { forwardRef } from 'react';
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
import {
  DialogDrawer,
  DialogDrawerBody,
  DialogDrawerContent,
  DialogDrawerDescription,
  DialogDrawerHeader,
  DialogDrawerTitle,
} from '~/components/ui/dialog-drawer';

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
    const {
      value: isShown,
      setTrue: show,
      setValue: toggle,
    } = useBoolean(false);
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
            variant="ghost"
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
            onOpenChange={toggle}
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
  onOpenChange: (value: boolean) => void;
}

function MaximizedEditor({
  children: _,
  value,
  isOpen,
  onOpenChange,
  error,
  label,
  supportingText,
  onChange,
  ...rest
}: PropsWithChildren<MaximizedEditorProps>) {
  const { name } = useFieldContext();

  return (
    <>
      <DialogDrawer open={isOpen} onOpenChange={onOpenChange}>
        <DialogDrawerContent className="md:max-w-[90%] md:w-[700px] lg:w-[1000px]">
          <DialogDrawerHeader>
            {label && <DialogDrawerTitle>{label}</DialogDrawerTitle>}
            {supportingText && (
              <DialogDrawerDescription>
                {supportingText}
              </DialogDrawerDescription>
            )}
          </DialogDrawerHeader>
          <DialogDrawerBody>
            <div className="py-2">
              <EditorInput
                id={`${name}-editor`}
                value={value}
                onChange={onChange}
                height="500px"
                {...rest}
              />

              <FieldMessage error={error}>{supportingText}</FieldMessage>
            </div>
          </DialogDrawerBody>
        </DialogDrawerContent>
      </DialogDrawer>
    </>
  );
}
