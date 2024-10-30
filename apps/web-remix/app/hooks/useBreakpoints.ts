import { useMediaQuery } from 'usehooks-ts';

export const useBreakpoints = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const isLarge = useMediaQuery('(min-width: 1024px)');
  return { isDesktop, isLarge };
};
