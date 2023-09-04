'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button, Input, RadioCardGroup } from '@elpassion/taco';
import { TCreatePipeline } from '~/contracts';
import { pipelinesApi } from '~/modules/Api';
import { ROUTES } from '~/modules/Config';

// TODO (hub33k): use zod here instead
type Inputs = {
  name: string;
  type: 'stream' | 'sequential';
  organization_id: string;
};

export const CreatePipelineForm = () => {
  const router = useRouter();
  const params = useParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Inputs>();

  const [type, setType] = React.useState('');

  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async (payload: TCreatePipeline) => {
      return await pipelinesApi.create(
        params.organizationId as string,
        payload,
      );
    },
    onSuccess: async (data: any) => {
      await queryClient.invalidateQueries({
        queryKey: ['pipelines', params.organizationId],
      });
      router.push(
        ROUTES.PIPELINE(params.organizationId as string, data.data.id),
      );
    },
    onError: (error) => {
      console.error('Oops! Something went wrong!');
      console.error(error);
    },
  });

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    const payload = {
      name: data.name,
      organization_id: 1,
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col">
          <Input
            id="name"
            ariaLabel=""
            ariaLive="polite"
            errorMessage={errors.name?.message}
            label="Workflow name"
            placeholder="Audio chat with AI"
            supportingText="It will help you identify it in Warda.ai"
            type="text"
            isError={!!errors.name}
            {...register('name', {
              required: 'Name must be a string!',
            })}
          />

          <div className="mb-6" />

          <div>
            <RadioCardGroup
              // For now disabled
              disabled={true}
              id="type"
              name="type"
              onChange={function noRefCheck(value) {
                setType(value);
              }}
              value={type}
              cardsSize="md"
              // TODO (hub33k): handle validation
              errorMessage=""
              isRadioVisible
              layout="vertical"
              mainLabel="Workflow type"
              // TODO (hub33k): add description: You will not be able to change the workflow afterward.
              radioPosition="left"
              options={[
                {
                  id: 'stream',
                  value: 'stream',
                  labelText: 'Stream',
                  description:
                    'Input data will be processed in real time (streamed). Useful for applications that require immediate system feedback, such as translation or transcription apps.',
                },
                {
                  id: 'sequential',
                  value: 'sequential',
                  labelText: 'Sequential',
                  description:
                    'A repeatable workflow, where data is processed every time a specific event is triggered. Useful for event-based automation.',
                },
              ]}
            />
          </div>

          <div className="mb-6" />

          <div className="flex justify-end">
            <Button text="Create workflow" type="submit" />
          </div>
        </div>
      </form>
    </div>
  );
};
