import { useFormContext } from 'react-hook-form';
import { FieldProps } from './Schema';
import { assert } from '~/utils/assert';
import { Input, InputNumber, Radio, RadioCardGroup } from '@elpassion/taco';

export function StringField({ field, name }: FieldProps) {
  const { register, setValue, watch } = useFormContext();
  const fieldValue = watch(name!);
  assert(field.type === 'string');
  if (!('enum' in field)) {
    return (
      <Input
        id={name!}
        {...register(name!)}
        label={field.title}
        supportingText={field.description}
      />
    );
  }
  if (field.enumPresentAs === 'radio') {
    const { disabled } = register(name!);
    return (
      <RadioCardGroup
        mainLabel={field.title}
        options={field.enum.map((value) => ({
          id: value,
          labelText: value,
          value: value,
        }))}
        id={name!}
        name={name!}
        onChange={(value) => {
          setValue(name!, value);
        }}
        disabled={disabled}
        value={fieldValue}
        layout="horizontal"
        cardsSize="sm"
        isRadioVisible
      />
    );
  }
  if (field.enumPresentAs === 'checkbox') return null;
}

export function NumberField({ field, name }: FieldProps) {
  const { register, setValue } = useFormContext();
  const { onChange, ...methods } = register(name!);
  assert(field.type === 'number');
  return (
    <InputNumber
      id={name!}
      onChange={(value) => setValue(name!, value)}
      {...methods}
      label={field.title}
      supportingText={field.description}
    />
  );
}
