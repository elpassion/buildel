'use client';
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button, Input } from '@elpassion/taco';
import { ISignUp } from '~/contracts/auth.contracts';
import { AuthApi } from '~/modules/Api/Auth/AuthApi';
interface SignUpFormProps {
  onSignUp?: (data: ISignUp) => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = () => {
  const authApi = new AuthApi();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ISignUp>();

  const onSubmit: SubmitHandler<ISignUp> = async (formData) => {
    try {
      console.log(formData);
      // await authApi.signUp(formData);
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
