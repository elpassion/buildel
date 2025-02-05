import z from 'zod';

export const schema = z.object({
  email: z.string().email(),
});

export const schemaWithCaptcha = schema.extend({
  captchaToken: z.string().min(10, 'Please complete the captcha.'),
});
