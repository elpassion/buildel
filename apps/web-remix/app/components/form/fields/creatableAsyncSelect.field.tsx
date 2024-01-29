import React, { FormEvent, forwardRef, useEffect, useState } from "react";
import { SingleValue } from "react-select";
import { withZod } from "@remix-validated-form/with-zod";
import { useControlField, ValidatedForm } from "remix-validated-form";
import { IDropdownOption } from "@elpassion/taco/Dropdown";
import { Button, Label } from "@elpassion/taco";
import { Modal } from "@elpassion/taco/Modal";
import { toSelectOption } from "~/components/form/fields/asyncSelect.field";
import {
  HiddenField,
  useFieldContext,
} from "~/components/form/fields/field.context";
import {
  generateZODSchema,
  JSONSchemaField,
} from "~/components/form/schema/SchemaParser";
import { useModal } from "~/hooks/useModal";
import { Schema } from "~/components/form/schema/Schema";
import {
  ArrayField,
  BooleanField,
  NumberField,
  StringField,
} from "~/components/form/schema/SchemaFields";
import {
  asyncSelectApi,
  IAsyncSelectItem,
  IAsyncSelectItemList,
} from "~/api/AsyncSelectApi";
import {
  AsyncSelectInput,
  AsyncSelectInputProps,
} from "~/components/form/inputs/asyncSelect.input";
import { successToast } from "~/components/toasts/successToast";

interface CreatableAsyncSelectFieldProps
  extends Partial<Omit<AsyncSelectInputProps, "defaultValue">> {
  schema: JSONSchemaField;
  url: string;
  defaultValue?: string;
}
export const CreatableAsyncSelectField = forwardRef<
  HTMLSelectElement,
  CreatableAsyncSelectFieldProps
>(
  (
    { label, supportingText, url, defaultValue, schema: JSONSchema, ...props },
    _ref
  ) => {
    const { name, getInputProps, validate } = useFieldContext();
    const { isModalOpen, openModal, closeModal } = useModal();
    const schema = generateZODSchema(JSONSchema as any);
    const validator = React.useMemo(() => withZod(schema), []);
    const [selectedId, setSelectedId] = useControlField<string>(name);
    const [options, setOptions] = useState<IAsyncSelectItemList>([]);

    const getSelectedOption = () => {
      return options.find(
        (option) => option.id.toString() === selectedId?.toString()
      );
    };

    const selectedOption = getSelectedOption();

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

        setOptions((prev) => [...prev, newItem]);
        handleSetSelectedId(newItem.id.toString());
        closeModal();
        successToast({ title: "Success", description: "Item created!" });
      } catch (e) {
        console.error(e);
      }
    };

    const loadOptions = (
      _input: string,
      callback: (options: IDropdownOption[]) => void
    ) => {
      asyncSelectApi.getData(url).then((options) => {
        if (
          defaultValue &&
          !options.find((option) => option.id === defaultValue)
        ) {
          options = [{ id: defaultValue, name: defaultValue }, ...options];
        }
        setOptions(options);
        callback(options.map(toSelectOption));
      });
    };

    useEffect(() => {
      if (!selectedId && defaultValue) {
        handleSetSelectedId(defaultValue);
      }
    }, [selectedId, handleSetSelectedId]);

    return (
      <>
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

        <HiddenField value={selectedId} {...getInputProps()} />

        <AsyncSelectInput
          cacheOptions
          defaultOptions
          id={name}
          value={selectedOption && toSelectOption(selectedOption)}
          loadOptions={loadOptions}
          onSelect={(option: SingleValue<IDropdownOption>) => {
            if (option) {
              handleSetSelectedId(option.id);
            }
          }}
          {...props}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          overlayClassName="!z-[60]"
          className="w-[90%] min-w-[340px] max-w-[500px]"
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
            <ValidatedForm
              // @ts-ignore
              validator={validator}
              className="w-full grow flex flex-col"
              onSubmit={handleCreate}
              noValidate
            >
              <Schema
                schema={JSONSchema as any}
                name={null}
                fields={{
                  string: StringField,
                  number: NumberField,
                  array: ArrayField,
                  boolean: BooleanField,
                  editor: () => <></>,
                  asyncSelect: () => <></>,
                  asyncCreatableSelect: () => <></>,
                }}
              />

              <Button
                size="sm"
                type="submit"
                variant="filled"
                className="mt-6"
                isFluid
              >
                Create new
              </Button>
            </ValidatedForm>
          </div>
        </Modal>
      </>
    );
  }
);
