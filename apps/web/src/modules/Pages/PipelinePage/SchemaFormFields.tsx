import { Checkbox, Input, InputNumber, RadioCardGroup } from '@elpassion/taco';
import { useFormContext } from 'react-hook-form';
import { assert } from '~/utils/assert';
import { FieldProps } from './Schema';

export function StringField({ field, name }: FieldProps) {
  const { register, setValue, watch } = useFormContext();
  assert(name);
  const fieldValue = watch(name);
  assert(field.type === 'string');
  if (!('enum' in field)) {
    return (
      <Input
        id={name}
        {...register(name)}
        label={field.title}
        supportingText={field.description}
      />
    );
  }
  if (field.enumPresentAs === 'radio') {
    const { disabled } = register(name);
    return (
      <RadioCardGroup
        mainLabel={field.title}
        options={field.enum.map((value) => ({
          id: value,
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
        isRadioVisible
      />
    );
  }
  if (field.enumPresentAs === 'checkbox') {
    const key = name.split('.').slice(0, -1).join('.');
    const methods = register(key);

    return field.enum.map((value, index) => (
      <Checkbox
        key={key}
        labelText={value}
        id={`${key}.${index}`}
        value={value}
        {...methods}
      />
    ));
  }
}

export function NumberField({ field, name }: FieldProps) {
  const { register, setValue } = useFormContext();
  assert(name);
  const { onChange, ...methods } = register(name);
  assert(field.type === 'number');

  return (
    <InputNumber
      id={name}
      onChange={(value) => setValue(name, value)}
      {...methods}
      label={field.title}
      supportingText={field.description}
    />
  );
}
