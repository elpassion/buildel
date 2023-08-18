'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type SubmitHandler, useForm } from 'react-hook-form';
import z from 'zod';
import { Button, Input } from '@elpassion/taco';
import { TCreateApp } from '~/contracts';
import { AppsApi } from '~/modules/Api';

const appsApi = new AppsApi();

// TODO (hub33k): use zod here instead
type Inputs = {
  name: string;
};

export const CreateAppForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<Inputs>();

  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async (payload: TCreateApp) => {
      return await appsApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apps'] });
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
        version: 1,
        blocks: [],
      },
    };
    try {
      mutate(
        {
          pipeline: payload,
        },
        {
          onSuccess: () => {
            reset();
          },
        },
      );
    } catch (e) {}
  };

  return (
    <div className="border p-4">
      <p>Create new app</p>

      <div className="mb-4" />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col">
          <Input
            id="name"
            ariaLabel=""
            ariaLive="polite"
            errorMessage=""
            label="App name"
            placeholder="App name"
            type="text"
            isError={!!errors.name}
            supportingText={errors.name?.message}
            {...register('name', {
              required: 'Name must be a string!',
            })}
          />
          {/*{errors.name && <span>This field is required</span>}*/}

          <div className="mb-4" />

          <Button text="Create app" type="submit" />
        </div>
      </form>
    </div>
  );
};
