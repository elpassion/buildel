import { useEffect, useRef } from 'react';

import { assert } from '~/utils/assert';

interface UseSoundArgs {
  src: string;
}

export const useSound = ({ src }: UseSoundArgs) => {
  const soundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    soundRef.current = new Audio(src);
  }, [src]);

  const play = () => {
    assert(soundRef.current, 'Sound is not defined');

    soundRef.current.play();
  };

  return { play };
};
