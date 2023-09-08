'use client';
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button, Input } from '@elpassion/taco';
import { ISignIn, signInSchema } from '~/contracts/auth.contracts';
import { AuthApi } from '~api/Auth/AuthApi';
import { useRouter } from 'next/navigation';
import { ROUTES } from '~/modules/Config';
interface SignInFormProps {
  onSignIn?: (data: ISignIn) => Promise<void>;
}

export const SignInForm: React.FC<SignInFormProps> = ({ onSignIn }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ISignIn>({ resolver: zodResolver(signInSchema) });
  const router = useRouter();
  const authApi = new AuthApi();
  const handleSignIn = async (formData: ISignIn) => {
    try {
      console.log(formData);
      await authApi.signIn(formData);
      router.push(ROUTES.HOME);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form className="w-full space-y-4" onSubmit={handleSubmit(handleSignIn)}>
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
