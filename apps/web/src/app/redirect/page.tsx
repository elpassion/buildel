'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function RedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    const destination = searchParams.get('destination');

    router.push(destination as string);
  }, []);

  return null;
}
