import React from 'react';
import { vi } from 'vitest';

vi.mock('react-google-recaptcha', () => {
  const RecaptchaV2 = React.forwardRef((props, ref) => (
    <input
      data-testid="mock-v2-captcha-element"
      ref={ref}
      {...props}
      onChange={(e) => props?.onChange?.(e.target.value)}
    />
  ));

  return {
    __esModule: true,
    default: RecaptchaV2,
  };
});
