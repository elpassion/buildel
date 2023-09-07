import React from 'react';
import Link from 'next/link';
import { ISignUp } from '~/contracts/auth.contracts';
import { SignUpForm } from '~/modules/Auth/SignUpForm';
import { ROUTES } from '~/modules/Config';
import { AuthApi } from '~api/Auth/AuthApi';

export const SignUpPage: React.FC = () => {
  const authApi = new AuthApi();
  const handleSignUp = async (formData: ISignUp) => {
    'use server';
    try {
      console.log(formData);
      // await authApi.signUp(formData);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="flex flex-col items-center px-4 py-6 ">
      <h1 className="mb-1 text-center text-2xl font-bold text-neutral-900">
        Register for an account
      </h1>
      <p className="text-center text-sm text-neutral-700">
        Already registered?{' '}
        <Link className="text-primary-500" href={ROUTES.SIGN_IN}>
          Sign in
        </Link>{' '}
        to your account now.
      </p>

      <div className="mt-6 w-full max-w-sm">
        <SignUpForm onSignUp={handleSignUp} />
      </div>
    </div>
  );
};
