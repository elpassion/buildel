import React, { useEffect } from "react";
import { useFieldArray, useFormContext } from "remix-validated-form";
import { Button, Icon, IconButton } from "@elpassion/taco";
import { Field as FormField } from "~/components/form/fields/field.context";
import {
  PasswordInputField,
  TextInputField,
} from "~/components/form/fields/text.field";
import { CheckboxInput } from "~/components/form/inputs/checkbox.input";
import { CheckboxInputField } from "~/components/form/fields/checkbox.field";
import { assert } from "~/utils/assert";
import { Field, FieldProps } from "./Schema";
import { QuantityInputField } from "~/components/form/fields/quantity.field";
import { RadioField } from "~/components/form/fields/radio.field";

export function StringField({ field, name, fields, ...rest }: FieldProps) {
  assert(name);
  assert(field.type === "string");

  const { fieldErrors } = useFormContext();

  const error = fieldErrors[name] ?? undefined;

  if (!("enum" in field)) {
    if ("presentAs" in field && field.presentAs === "password") {
      return (
        <FormField name={name}>
          <PasswordInputField
            id={name}
            supportingText={field.description}
            label={field.title}
            errorMessage={error}
          />
        </FormField>
      );
    }

    if ("presentAs" in field && field.presentAs === "editor") {
      return (
        <fields.editor field={field} name={name} fields={fields} {...rest} />
      );
    }

    return (
      <FormField name={name}>
        <TextInputField
          id={name}
          supportingText={field.description}
          label={field.title}
          errorMessage={error}
          defaultValue={field.default}
        />
      </FormField>
    );
  }
  if (field.enumPresentAs === "radio") {
    return (
      <FormField name={name}>
        <div className="space-y-3">
          {field.enum.map((value, index) => (
            <RadioField
              key={value}
              id={name + index}
              name={name}
              errorMessage={error ?? undefined}
              labelText={value}
              value={value}
              defaultValue={field.default}
            />
          ))}
        </div>
      </FormField>
    );
  }
  if (field.enumPresentAs === "checkbox") {
    return field.enum.map((value, index) => (
      <FormField key={`${name}.${index}`} name={name}>
        <CheckboxInput
          name={name}
          key={value}
          labelText={value}
          id={`${name}.${index}`}
          value={value}
          error={!!error}
        />
      </FormField>
    ));
  }
}

export function NumberField({ field, name }: FieldProps) {
  assert(name);
  assert(field.type === "number");
  const { fieldErrors } = useFormContext();

  const error = fieldErrors[name] ?? undefined;
  return (
    <FormField name={name}>
      <QuantityInputField
        id={name}
        errorMessage={error}
        label={field.title}
        // supportingText={field.description}
        minValue={field.minimum}
        maxValue={field.maximum}
        defaultValue={field.default}
        step={field.step}
      />
    </FormField>
  );
}

export function ArrayField({ field, name, fields, schema }: FieldProps) {
  assert(field.type === "array");
  if ("enum" in field.items && field.items.enumPresentAs === "checkbox") {
    return (
      <>
        <p>{field.title}</p>
        <fields.string
          field={field.items}
          name={name}
          schema={schema}
          fields={fields}
        />
      </>
    );
  } else {
    return (
      <RealArrayField
        field={field}
        name={name}
        fields={fields}
        schema={schema}
      />
    );
  }
}

export function BooleanField({ field, name }: FieldProps) {
  assert(name);
  assert(field.type === "boolean");
  const { fieldErrors } = useFormContext();

  const error = fieldErrors[name] ?? undefined;

  return (
    <FormField name={name}>
      <CheckboxInputField
        id={name}
        labelText={field.title}
        defaultValue={"false"}
        error={!!error}
      />
    </FormField>
  );
}

function RealArrayField({ field, name, fields, schema }: FieldProps) {
  assert(field.type === "array");
  const [rhfFields, { push, remove }] = useFieldArray(name!);

  useEffect(() => {
    if (rhfFields.length !== 0) return;

    push({});
  }, [push, rhfFields.length]);

  return (
    <div>
      {rhfFields.map((item, index) => (
        <div key={item.key} className="mt-2 flex flex-col gap-2">
          <Field
            key={item.key}
            field={field.items}
            name={`${name}[${index}]`}
            fields={fields}
            schema={schema}
          />
          <IconButton
            variant="ghost"
            icon={<Icon iconName="trash" />}
            disabled={rhfFields.length === 1}
            onClick={(e) => {
              e.preventDefault();
              remove(index);
            }}
          />
        </div>
      ))}
      <Button
        type="button"
        size="xs"
        hierarchy="secondary"
        onClick={() => push({})}
        className="mt-2"
      >
        Add item
      </Button>
    </div>
  );
}
