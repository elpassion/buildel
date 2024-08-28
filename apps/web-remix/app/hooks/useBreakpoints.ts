import { useMediaQuery } from 'usehooks-ts';

export const useBreakpoints = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  return { isDesktop };
};
