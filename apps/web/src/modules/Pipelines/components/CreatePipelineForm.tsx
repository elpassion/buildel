'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button, Input } from '@elpassion/taco';
import { TCreatePipeline } from '~/contracts';
import { PipelinesApi } from '~/modules/Api';

const appsApi = new PipelinesApi();

// TODO (hub33k): use zod here instead
type Inputs = {
  name: string;
};

export const CreatePipelineForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Inputs>();

  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async (payload: TCreatePipeline) => {
      return await appsApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
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
      // TODO (hub33k): this should return pipeline data
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
      // TODO (hub33k): redirect to pipeliens/{pipelineId}
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
          {/*{errors.name && <span>This field is required</span>}*/}

          <div className="mb-4" />

          <Button text="Create" type="submit" />
        </div>
      </form>
    </div>
  );
};
