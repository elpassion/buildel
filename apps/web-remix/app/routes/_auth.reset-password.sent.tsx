import { Link } from '@remix-run/react';
import type { MetaFunction } from '@remix-run/react';

export function loader() {
  return {};
}

export default function ResetPasswordSent() {
  return (
    <div className="my-auto flex flex-col w-full justify-center items-center">
      <h1 className="text-center text-3xl font-bold text-neutral-100">
        Reset password instructions successfully sent!
      </h1>
      <p className="text-center text-neutral-100">
        Go back to{' '}
        <Link
          to={{
            pathname: '/login',
          }}
          className="text-primary-500"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: 'Reset Password Sent!',
    },
  ];
};
