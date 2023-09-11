import React from "react";
import { Button, Icon, IconButton } from "@elpassion/taco";
import { Field, FieldProps } from "./Schema";
import { Field as FormField } from "~/components/form/fields/field.context";
import { assert } from "~/utils/assert";
import { TextInputField } from "~/components/form/fields/text.field";
import { CheckboxInput } from "~/components/form/inputs/checkbox.input";
import { NumberInputField } from "~/components/form/fields/number.field";
import { CheckboxInputField } from "~/components/form/fields/checkbox.field";
import { useFormContext } from "remix-validated-form";

export function StringField({ field, name }: FieldProps) {
  assert(name);

  assert(field.type === "string");
  const { fieldErrors } = useFormContext();

  const error = fieldErrors[name] ?? undefined;

  if (!("enum" in field)) {
    if (field.presentAs === "password") {
      return (
        <FormField name={name}>
          <TextInputField
            id={name}
            type="password"
            supportingText={field.description}
            label={field.title}
            errorMessage={error}
          />
        </FormField>
      );
    }
    return (
      <FormField name={name}>
        <TextInputField
          id={name}
          type="password"
          supportingText={field.description}
          label={field.title}
          errorMessage={error}
        />
      </FormField>
    );
  }
  if (field.enumPresentAs === "radio") {
    // const { disabled } = register(name);
    return (
      <p>RadioCardGroup</p>
      // <RadioCardGroup
      //   isRadioVisible={true}
      //   radioPosition="left"
      //   mainLabel={field.title}
      //   options={field.enum.map((value) => ({
      //     id: `${name}.${value}`,
      //     labelText: value,
      //     value: value,
      //   }))}
      //   id={name}
      //   name={name}
      //   onChange={(value) => {
      //     setValue(name, value);
      //   }}
      //   disabled={disabled}
      //   value={fieldValue}
      //   layout="horizontal"
      //   cardsSize="sm"
      //   errorMessage={error?.message ?? undefined}
      // />
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
  // const {
  //   register,
  //   setValue,
  //   formState: { errors },
  // } = useFormContext();
  assert(name);
  // const { onChange, ...methods } = register(name, { valueAsNumber: true });
  assert(field.type === "number");
  const { fieldErrors } = useFormContext();

  const error = fieldErrors[name] ?? undefined;
  return (
    <FormField name={name}>
      <NumberInputField
        id={name}
        // onChange={(value) => setValue(name, value)}

        errorMessage={error}
        label={field.title}
        supportingText={field.description}
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
  // const {
  //   fields: rhfFields,
  //   append,
  //   remove,
  // } = useFieldArray({
  //   name: name!,
  // });

  // useEffect(() => {
  //   if (rhfFields.length !== 0) return;
  //   append({}, { shouldFocus: false });
  // }, [rhfFields.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <p>Field array</p>
      {/*{rhfFields.map((item, index) => (*/}
      {/*  <div key={item.id} className="mt-2 flex items-end gap-2">*/}
      {/*    <Field*/}
      {/*      key={item.id}*/}
      {/*      field={field.items}*/}
      {/*      name={`${name}.${index}`}*/}
      {/*      fields={fields}*/}
      {/*      schema={schema}*/}
      {/*    />*/}
      {/*    <IconButton*/}
      {/*      variant="ghost"*/}
      {/*      icon={<Icon iconName="trash" />}*/}
      {/*      disabled={rhfFields.length === 1}*/}
      {/*      onClick={(e) => {*/}
      {/*        e.preventDefault();*/}
      {/*        remove(index);*/}
      {/*      }}*/}
      {/*    />*/}
      {/*  </div>*/}
      {/*))}*/}
      <Button
        type="button"
        text={`Add item`}
        size="xs"
        hierarchy="secondary"
        // onClick={() => append({})}
        className="mt-2"
      />
    </div>
  );
}
