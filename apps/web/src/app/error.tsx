'use client';
import { useRouter } from 'next/navigation';
import { ROUTES } from '~/modules/Config';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();
  if (error.message === 'Unauthorized') {
    router.push(ROUTES.SIGN_IN);

    return null;
  }

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </button>
    </div>
  );
}
