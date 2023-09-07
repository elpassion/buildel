'use client';
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button, Input } from '@elpassion/taco';
import { ISignIn } from '~/contracts/auth.contracts';
import { AuthApi } from '~/modules/Api/Auth/AuthApi';
interface SignInFormProps {
  onSignIn?: (data: ISignIn) => void;
}

export const SignInForm: React.FC<SignInFormProps> = () => {
  const authApi = new AuthApi();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ISignIn>();

  const onSubmit: SubmitHandler<ISignIn> = async (formData) => {
    try {
      console.log(formData);
      // await authApi.signIn(formData);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <Input
        id="name"
        errorMessage={errors.email?.message}
        label="Email"
        type="text"
        {...register('email')}
      />

      <Input
        id="name"
        errorMessage={errors.password?.message}
        label="Password"
        type="password"
        {...register('password')}
      />

      <Button text="Sign in" type="submit" isFluid />
    </form>
  );
};
