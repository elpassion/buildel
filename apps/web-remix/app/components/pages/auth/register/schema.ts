import z from 'zod';

export const schema = z.object({
  user: z.object({
    email: z.string().email(),
    password: z.string().min(12),
  }),
  redirectTo: z.string().optional(),
});

export const schemaWithCaptcha = schema.extend({
  captchaToken: z.string().min(10, 'Please complete the captcha.'),
});
