import React from 'react';
import Link from 'next/link';
import { SignInForm } from '~/modules/Auth/SignInForm';
import { ROUTES } from '~/modules/Config';

export const SignInPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center px-4 py-6 ">
      <h1 className="mb-1 text-center text-2xl font-bold text-neutral-900">
        Sign in to account
      </h1>
      <p className="text-center text-sm text-neutral-700">
        Dont have an account?{' '}
        <Link className="text-primary-500" href={ROUTES.SIGN_UP}>
          Sign up
        </Link>{' '}
        for an account now.
      </p>

      <div className="mt-6 w-full max-w-sm">
        <SignInForm />
      </div>
    </div>
  );
};
