'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button, Input } from '@elpassion/taco';
import { TCreatePipeline } from '~/contracts';
import { PipelinesApi } from '~/modules/Api';
import { ROUTES } from '~/modules/Config';

const pipelinesApi = new PipelinesApi();

// TODO (hub33k): use zod here instead
type Inputs = {
  name: string;
};

export const CreatePipelineForm = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Inputs>();

  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async (payload: TCreatePipeline) => {
      return await pipelinesApi.create(payload);
    },
    onSuccess: async (data: any) => {
      await queryClient.invalidateQueries({ queryKey: ['pipelines'] });
      router.push(ROUTES.PIPELINE(data.data.id));
    },
    onError: (error) => {
      console.error('Oops! Something went wrong!');
      console.error(error);
    },
  });

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    const payload = {
      name: data.name,
      config: {
        version: '1',
        blocks: [],
      },
    };
    try {
      mutate(
        {
          pipeline: payload,
        },
        {
          onSuccess: (data) => {
            reset();
          },
        },
      );
    } catch (e) {}
  };

  return (
    <div>
      <p>Create new pipeline</p>

      <div className="mb-4" />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col">
          <Input
            id="name"
            ariaLabel=""
            ariaLive="polite"
            errorMessage={errors.name?.message}
            label="Pipeline name"
            placeholder="Pipeline name"
            type="text"
            isError={!!errors.name}
            {...register('name', {
              required: 'Name must be a string!',
            })}
          />

          <div className="mb-4" />

          <Button text="Create" type="submit" />
        </div>
      </form>
    </div>
  );
};
