import { http, HttpResponse } from 'msw';

import type { ICurrentUser } from '~/api/CurrentUserApi';

export const handlers = [
  http.post('/super-api/users/register', () => {
    return HttpResponse.json(null, {
      headers: {
        'Set-Cookie':
          '_buildel_key=123; path=/; secure; HttpOnly; SameSite=Lax',
      },
    });
  }),

  http.get('/super-api/users/register', () => {
    return HttpResponse.json(
      { data: { registration_disabled: false } },
      {
        headers: {
          'Set-Cookie':
            '_buildel_key=123; path=/; secure; HttpOnly; SameSite=Lax',
        },
      },
    );
  }),

  http.get('/super-api/users/me', () => {
    return HttpResponse.json(
      { data: { id: 1, marketing_agreement: false } as ICurrentUser },
      { status: 200 },
    );
  }),

  http.post('/api/captcha', () => {
    return HttpResponse.json('ok', { status: 200 });
  }),
];

export const errorHandlers = [
  http.post(
    '/super-api/users/register',
    () => {
      return HttpResponse.json(
        { errors: { global: ['email has already been taken'] } },
        {
          status: 422,
        },
      );
    },
    { once: true },
  ),
];
