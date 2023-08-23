import { useMediaQuery } from '@mantine/hooks';
import { defaultCSSBreakpoints } from '~/modules/Config';
import { useMediaQuery as customMediaQuery } from '~/utils/hooks';

export function useBreakpoints() {
  const desktop = useMediaQuery(defaultCSSBreakpoints.desktop, true, {
    getInitialValueInEffect: false,
  });
  const tablet = useMediaQuery(defaultCSSBreakpoints.tablet, true, {
    getInitialValueInEffect: false,
  });
  const mobile = useMediaQuery(defaultCSSBreakpoints.mobile, true, {
    getInitialValueInEffect: false,
  });

  const matchesDesktop = customMediaQuery(defaultCSSBreakpoints.desktop);
  const matchesTablet = customMediaQuery(defaultCSSBreakpoints.tablet);
  const matchesMobile = customMediaQuery(defaultCSSBreakpoints.mobile);

  return {
    desktop,
    tablet,
    mobile,

    // custom
    matchesDesktop,
    matchesTablet,
    matchesMobile,
  };
}
