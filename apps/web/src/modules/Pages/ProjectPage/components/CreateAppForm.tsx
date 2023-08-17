'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { Button, Input } from '@elpassion/taco';
import { AppsApi } from '~/modules/Api';

const appsApi = new AppsApi();

type Inputs = {
  name: string;
  version: string;
  blocks: string;
};

export const CreateAppForm = () => {
  // TODO (hub33k): use react-query
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();

  const { data, mutate } = useMutation({
    // queryKey: ['posts'],
    // queryFn: getPosts,
    // initialData: props.posts,
  });

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    console.log(data);
    // appsApi.
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          id="name"
          ariaLabel=""
          ariaLive="polite"
          errorMessage=""
          label="App name"
          placeholder="App name"
          type="text"
          isError={!!errors.name}
          {...register('name', {
            required: true,
          })}
        />
        {/*{errors.name && <span>This field is required</span>}*/}

        <Button text="Create app" type="submit" />
      </form>
    </>
  );
};
