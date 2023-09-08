'use client';
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button, Input } from '@elpassion/taco';
import { AuthApi } from '~api/Auth/AuthApi';
import { ISignUp, signUpSchema } from '~/contracts/auth.contracts';

interface SignUpFormProps {
  onSignUp?: (data: ISignUp) => Promise<void>;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSignUp }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ISignUp>({ resolver: zodResolver(signUpSchema) });
  const authApi = new AuthApi();

  const onSubmit: SubmitHandler<ISignUp> = async (formData) => {
    try {
      console.log(formData);
      await authApi.signUp(formData);
    } catch (err) {
      console.error(err);
    }
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

      <Button text="Sign up" type="submit" isFluid />
    </form>
  );
};
