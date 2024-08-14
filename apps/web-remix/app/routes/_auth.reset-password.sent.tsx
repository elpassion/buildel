import { Link } from '@remix-run/react';
import type { MetaFunction } from '@remix-run/react';

import { metaWithDefaults } from '~/utils/metadata';

export function loader() {
  return {};
}

export default function ResetPasswordSent() {
  return (
    <div className="my-auto flex flex-col w-full justify-center items-center">
      <h1 className="text-center text-3xl font-bold">
        Reset password instructions successfully sent!
      </h1>
      <p className="text-center text-muted-foreground">
        Go back to{' '}
        <Link
          to={{
            pathname: '/login',
          }}
          className="text-foreground"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}

export const meta: MetaFunction = metaWithDefaults(() => {
  return [
    {
      title: 'Reset Password Sent!',
    },
  ];
});
