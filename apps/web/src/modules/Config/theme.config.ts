type Breakpoint = { min?: string; max?: string };

export interface Breakpoints {
  mobile?: Breakpoint;
  tablet?: Breakpoint; // narrow
  desktop?: Breakpoint; // wide
}

export const defaultBreakpoints: Required<Breakpoints> = {
  mobile: { max: '767px' },
  tablet: { min: '768px', max: '1023px' },
  desktop: { min: '1024px' },
};

export interface CSSBreakpoints {
  mobile?: string;
  tablet?: string;
  desktop?: string;
}
export const defaultCSSBreakpoints: Required<CSSBreakpoints> = {
  mobile: `(max-width: ${defaultBreakpoints.mobile.max})`,
  tablet: `(min-width: ${defaultBreakpoints.tablet.min}) and (max-width: ${defaultBreakpoints.tablet.max})`,
  desktop: `(min-width: ${defaultBreakpoints.desktop.min})`,
};
