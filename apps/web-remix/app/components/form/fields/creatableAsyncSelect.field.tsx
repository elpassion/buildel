import React, {
  FormEvent,
  forwardRef,
  PropsWithChildren,
  ReactNode,
  useCallback,
} from "react";
import { withZod } from "@remix-validated-form/with-zod";
import { useControlField, ValidatedForm } from "remix-validated-form";
import { InputText, Label } from "@elpassion/taco";
import { toSelectOption } from "~/components/form/fields/asyncSelect.field";
import { asyncSelectApi, IAsyncSelectItem } from "~/api/AsyncSelectApi";
import { successToast } from "~/components/toasts/successToast";
import { Modal } from "@elpassion/taco/Modal";
import { useModal } from "~/hooks/useModal";
import {
  HiddenField,
  useFieldContext,
} from "~/components/form/fields/field.context";
import {
  generateZODSchema,
  JSONSchemaField,
} from "~/components/form/schema/SchemaParser";
import {
  AsyncSelectInput,
  AsyncSelectInputProps,
} from "~/components/form/inputs/select/select.input";
import { SubmitButton } from "../submit";

export interface CreatableAsyncSelectFieldProps
  extends Partial<AsyncSelectInputProps> {
  url: string;
  label?: ReactNode;
  supportingText?: ReactNode;
  errorMessage?: ReactNode;
  schema: JSONSchemaField;
  renderForm: ({
    onCreate,
  }: {
    onCreate: (
      data: Record<string, any>,
      e: FormEvent<HTMLFormElement>
    ) => void;
  }) => ReactNode;
}

export const CreatableAsyncSelectField = forwardRef<
  HTMLSelectElement,
  CreatableAsyncSelectFieldProps
>(
  (
    {
      label,
      supportingText,
      url,
      errorMessage,
      defaultValue,
      schema: JSONSchema,
      renderForm,
      ...props
    },
    _ref
  ) => {
    const { name, getInputProps, validate } = useFieldContext();
    const { isModalOpen, openModal, closeModal } = useModal();

    const [selectedId, setSelectedId] = useControlField<string>(name);

    const handleSetSelectedId = (id: string) => {
      setSelectedId(id);
      validate();
    };

    const handleCreate = async (
      data: Record<string, any>,
      e: FormEvent<HTMLFormElement>
    ) => {
      e.preventDefault();
      try {
        const newItem = await asyncSelectApi.createData(
          url,
          data as IAsyncSelectItem
        );

        handleSetSelectedId(newItem.id.toString());
        successToast({ title: "Success", description: "Item created!" });
        closeModal();
      } catch (e) {
        console.error(e);
      }
    };

    const fetcher = useCallback(async () => {
      return asyncSelectApi
        .getData(url)
        .then((opts) => opts.map(toSelectOption));
    }, [url, isModalOpen]);

    return (
      <>
        <HiddenField value={selectedId} {...getInputProps()} />

        <div className="flex justify-between items-end">
          <Label text={label} labelFor={name} />

          <button
            className="text-primary-500 text-sm mb-[6px] bg-transparent"
            onClick={openModal}
            type="button"
          >
            Add new
          </button>
        </div>

        <AsyncSelectInput
          placeholder="Select..."
          fetchOptions={fetcher}
          defaultValue={defaultValue}
          onChange={setSelectedId}
          value={selectedId}
          {...props}
        />

        <InputText
          text={errorMessage ?? supportingText}
          error={!!errorMessage}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          overlayClassName="!z-[60]"
          className="w-[90%] min-w-[340px] md:min-w-[500px]"
          header={
            <header className="p-1 text-white">
              <p className="text-2xl mb-2">{label}</p>
              <p className="text-sm text-neutral-400">{supportingText}</p>
            </header>
          }
        >
          <div
            className="p-1"
            onSubmit={(e) => {
              e.stopPropagation();
            }}
            onChange={(e) => {
              e.stopPropagation();
            }}
          >
            {renderForm({ onCreate: handleCreate })}
          </div>
        </Modal>
      </>
    );
  }
);

interface CreatableAsyncFormProps {
  onCreate: (data: Record<string, any>, e: FormEvent<HTMLFormElement>) => void;
  schema: JSONSchemaField;
}

export function CreatableAsyncForm({
  onCreate,
  schema: JSONSchema,
  children,
}: PropsWithChildren<CreatableAsyncFormProps>) {
  const schema = generateZODSchema(JSONSchema as any);
  const validator = React.useMemo(() => withZod(schema), []);

  return (
    <ValidatedForm
      // @ts-ignore
      validator={validator}
      className="w-full grow flex flex-col"
      onSubmit={onCreate}
      noValidate
    >
      {children}

      <SubmitButton size="sm" variant="filled" className="mt-6" isFluid>
        Create new
      </SubmitButton>
    </ValidatedForm>
  );
}
