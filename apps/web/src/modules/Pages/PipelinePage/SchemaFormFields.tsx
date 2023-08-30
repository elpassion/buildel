import { useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import {
  Button,
  Checkbox,
  Icon,
  IconButton,
  Input,
  InputNumber,
  RadioCardGroup,
  Textarea,
} from '@elpassion/taco';
import { assert } from '~/utils/assert';
import { Field, FieldProps } from './Schema';

export function StringField({ field, name }: FieldProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();
  assert(name);
  const fieldValue = watch(name);
  assert(field.type === 'string');

  const error = getValueFromPath(errors, name);

  if (!('enum' in field)) {
    if (field.presentAs === 'password') {
      return (
        <Input
          id={name}
          {...register(name)}
          label={field.title}
          type="password"
          errorMessage={error?.message ?? undefined}
          supportingText={field.description}
        />
      );
    }
    return (
      <Textarea
        id={name}
        {...register(name)}
        label={field.title}
        supportingText={field.description}
        errorMessage={error?.message ?? undefined}
      />
    );
  }
  if (field.enumPresentAs === 'radio') {
    const { disabled } = register(name);
    return (
      <RadioCardGroup
        isRadioVisible={true}
        radioPosition="left"
        mainLabel={field.title}
        options={field.enum.map((value) => ({
          id: `${name}.${value}`,
          labelText: value,
          value: value,
        }))}
        id={name}
        name={name}
        onChange={(value) => {
          setValue(name, value);
        }}
        disabled={disabled}
        value={fieldValue}
        layout="horizontal"
        cardsSize="sm"
        errorMessage={error?.message ?? undefined}
      />
    );
  }
  if (field.enumPresentAs === 'checkbox') {
    const methods = register(name);

    return field.enum.map((value, index) => (
      <Checkbox
        key={value}
        labelText={value}
        id={`${name}.${index}`}
        value={value}
        error={!!error}
        {...methods}
      />
    ));
  }
}

export function NumberField({ field, name }: FieldProps) {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext();
  assert(name);
  const { onChange, ...methods } = register(name, { valueAsNumber: true });
  assert(field.type === 'number');
  const error = getValueFromPath(errors, name);
  return (
    <InputNumber
      id={name}
      onChange={(value) => setValue(name, value)}
      {...methods}
      label={field.title}
      errorMessage={error?.message ?? undefined}
      supportingText={field.description}
    />
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
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();
  assert(name);
  assert(field.type === 'boolean');
  const value = watch(name);
  return (
    <Checkbox
      id={name}
      labelText={field.title}
      defaultValue={'false'}
      checked={value}
      {...register(name)}
    />
  );
}

function RealArrayField({ field, name, fields, schema }: FieldProps) {
  assert(field.type === 'array');
  const {
    fields: rhfFields,
    append,
    remove,
  } = useFieldArray({
    name: name!,
  });

  useEffect(() => {
    if (rhfFields.length !== 0) return;
    append({}, { shouldFocus: false });
  }, [rhfFields.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <p>{field.title}</p>
      {rhfFields.map((item, index) => (
        <div key={item.id} className="mt-2 flex items-end gap-2">
          <Field
            key={item.id}
            field={field.items}
            name={`${name}.${index}`}
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
        text={`Add item`}
        size="xs"
        hierarchy="secondary"
        onClick={() => append({})}
        className="mt-2"
      />
    </div>
  );
}

function getValueFromPath(obj: Record<string, any>, path: string) {
  const keys = path.split('.');
  let current = obj;

  keys.forEach((key) => {
    if (!current || current[key] === undefined) return null;
    current = current[key];
  }, current);

  return current;
}
