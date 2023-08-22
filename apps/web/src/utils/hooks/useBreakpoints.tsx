import { useMediaQuery } from '@mantine/hooks';
import { defaultCSSBreakpoints } from '~/modules/Config';

export function useBreakpoints() {
  const desktop = useMediaQuery(defaultCSSBreakpoints.desktop, true, {
    getInitialValueInEffect: true,
  });
  const tablet = useMediaQuery(defaultCSSBreakpoints.tablet, true, {
    getInitialValueInEffect: true,
  });
  const mobile = useMediaQuery(defaultCSSBreakpoints.mobile, true, {
    getInitialValueInEffect: true,
  });

  return {
    desktop,
    tablet,
    mobile,
  };
}
