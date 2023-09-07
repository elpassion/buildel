'use client';
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button, Input } from '@elpassion/taco';
import { ISignIn } from '~/contracts/auth.contracts';
interface SignInFormProps {
  onSignIn?: (data: ISignIn) => Promise<void>;
}

export const SignInForm: React.FC<SignInFormProps> = ({ onSignIn }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ISignIn>();

  const onSubmit: SubmitHandler<ISignIn> = async (formData) => {
    onSignIn?.(formData);
  };

  return (
    <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <Input
        id="email"
        errorMessage={errors.email?.message}
        label="Email"
        type="text"
        {...register('email')}
      />

      <Input
        id="password"
        errorMessage={errors.password?.message}
        label="Password"
        type="password"
        {...register('password')}
      />

      <Button text="Sign in" type="submit" isFluid />
    </form>
  );
};
