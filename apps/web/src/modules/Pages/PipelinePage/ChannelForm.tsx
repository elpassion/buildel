import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@elpassion/taco';
import { SelectDropdown } from '@elpassion/taco/Dropdown';
import { BlocksIO, IIO } from '~/modules/Pipelines';

export function ChannelForm({
  onSubmit,
  io,
}: {
  onSubmit: (data: { message: string; io: IIO }) => void;
  io: BlocksIO;
}) {
  const textInputs = io.inputs.filter((input) => input.type === 'text');
  const { handleSubmit, register, setValue } = useForm<{
    message: string;
    io: IIO;
  }>({
    defaultValues: {
      message: '',
      io: textInputs.at(0),
    },
  });

  useEffect(() => {
    if (textInputs.length === 0) return;

    setValue('io', textInputs.at(0)!);
  }, [textInputs]);

  const ioField = register('io');

  return (
    <form
      onSubmit={handleSubmit((data) => {
        setValue('message', '');
        onSubmit(data);
      })}
      className="flex"
    >
      <SelectDropdown
        id="io"
        name={ioField.name}
        ref={ioField.ref}
        onSelect={(item: any) => {
          setValue(
            ioField.name,
            item ? textInputs.find((input) => input.name === item.id)! : null!,
          );
        }}
        options={textInputs.map(
          (input) =>
            ({
              id: input.name,
              label: input.name,
              value: input,
            } as any),
        )}
        isMulti={false}
      />
      <Input id="message" {...register('message')} />
      <button type="submit">Send</button>
    </form>
  );
}
