import React, { useEffect } from 'react';
import { Trash } from 'lucide-react';
import { useFieldArray, useFormContext } from 'remix-validated-form';

import { CheckboxInputField } from '~/components/form/fields/checkbox.field';
import { Field as FormField } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { QuantityInputField } from '~/components/form/fields/quantity.field';
import {
  RadioField,
  RadioGroupField,
} from '~/components/form/fields/radio.field';
import {
  PasswordInputField,
  ResettableTextInputField,
} from '~/components/form/fields/text.field';
import { CheckboxInput } from '~/components/form/inputs/checkbox.input';
import { IconButton } from '~/components/iconButton';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { assert } from '~/utils/assert';

import { Field } from './Schema';
import type { FieldProps } from './Schema';

export function StringField({ field, name, fields, ...rest }: FieldProps) {
  assert(name);
  assert(field.type === 'string');

  const { fieldErrors, getValues } = useFormContext();

  const error = fieldErrors[name] ?? undefined;

  if (!('enum' in field)) {
    if ('presentAs' in field && field.presentAs === 'password') {
      return (
        <FormField name={name}>
          <FieldLabel>{field.title}</FieldLabel>
          <PasswordInputField id={name} />
          <FieldMessage error={error}>{field.description}</FieldMessage>
        </FormField>
      );
    }

    if ('presentAs' in field && field.presentAs === 'editor') {
      return (
        <fields.editor field={field} name={name} fields={fields} {...rest} />
      );
    }

    if ('presentAs' in field && field.presentAs === 'async-select') {
      return (
        <fields.asyncSelect
          field={field}
          name={name}
          fields={fields}
          {...rest}
        />
      );
    }

    if ('presentAs' in field && field.presentAs === 'async-creatable-select') {
      return (
        <fields.asyncCreatableSelect
          field={field}
          name={name}
          fields={fields}
          {...rest}
        />
      );
    }

    let defaultValue = field.default;

    if ('defaultWhen' in field && field.defaultWhen) {
      const formValues = getValues();
      const defaultKey = Object.keys(field.defaultWhen)[0];
      const defaultFieldValue = formValues.get(defaultKey);

      if (typeof defaultFieldValue === 'string') {
        defaultValue = field.defaultWhen[defaultKey][defaultFieldValue];
      }
    }

    return (
      <FormField name={name}>
        <ResettableTextInputField
          id={name}
          defaultValue={defaultValue}
          label={field.title}
        />
        <FieldMessage error={error}>{field.description}</FieldMessage>
      </FormField>
    );
  }
  if (field.enumPresentAs === 'radio') {
    return (
      <FormField name={name}>
        <FieldLabel className="mb-1" htmlFor={name}>
          {field.title}
        </FieldLabel>
        <FieldMessage className="mt-0 mb-3" error={error}>
          {field.description}
        </FieldMessage>
        <RadioGroupField defaultValue={field.default}>
          {field.enum.map((value) => (
            <Label
              key={value}
              className="flex gap-1 items-center text-muted-foreground"
            >
              <RadioField id={value} value={value} />

              <span>{value}</span>
            </Label>
          ))}
        </RadioGroupField>
      </FormField>
    );
  }
  if (field.enumPresentAs === 'checkbox') {
    return field.enum.map((value, index) => (
      <FormField key={`${name}.${index}`} name={name}>
        <Label className="flex gap-1 items-center">
          <CheckboxInput
            name={name}
            key={value}
            id={`${name}.${index}`}
            value={value}
            // error={!!error}
          />

          <span>{value}</span>
        </Label>
      </FormField>
    ));
  }
}

export function NumberField({ field, name }: FieldProps) {
  assert(name);
  assert(field.type === 'number' || field.type === 'integer');
  const { fieldErrors } = useFormContext();

  const error = fieldErrors[name] ?? undefined;
  return (
    <FormField name={name}>
      <FieldLabel>{field.title}</FieldLabel>
      <QuantityInputField
        id={name}
        // supportingText={field.description}
        min={field.minimum}
        max={field.maximum}
        defaultValue={field.default}
        step={field.step}
      />
      <FieldMessage error={error}>{field.description}</FieldMessage>
    </FormField>
  );
}

export function ArrayField({ field, name, fields, schema }: FieldProps) {
  assert(field.type === 'array');
  if ('enum' in field.items && field.items.enumPresentAs === 'checkbox') {
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
  assert(field.type === 'boolean');
  // const { fieldErrors } = useFormContext();

  // const error = fieldErrors[name] ?? undefined;

  return (
    <FormField name={name}>
      <Label>
        <CheckboxInputField
          id={name}
          defaultChecked={field.default}
          // error={!!error}
        />

        <span>{field.title}</span>
      </Label>
    </FormField>
  );
}

function RealArrayField({ field, name, fields, schema }: FieldProps) {
  assert(field.type === 'array');
  const [rhfFields, { push, remove }] = useFieldArray(name!);

  useEffect(() => {
    if (rhfFields.length >= field.minItems) return;

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
            size="xxs"
            variant="ghost"
            aria-label="Remove field"
            icon={<Trash />}
            disabled={rhfFields.length <= field.minItems}
            onClick={(e) => {
              e.preventDefault();
              remove(index);
            }}
          />
        </div>
      ))}
      <Button
        type="button"
        size="xxs"
        variant="secondary"
        onClick={() => push({})}
        className="mt-2"
      >
        Add item
      </Button>
    </div>
  );
}
