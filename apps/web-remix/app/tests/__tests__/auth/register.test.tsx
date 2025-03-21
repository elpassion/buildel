import React from 'react';
import { describe, test } from 'vitest';

import { action } from '~/components/pages/auth/register/action.server';
import { loader } from '~/components/pages/auth/register/loader.server';
import { RegisterPage } from '~/components/pages/auth/register/page';
import { ButtonHandle } from '~/tests/handles/Button.handle';
import { InputHandle } from '~/tests/handles/Input.handle';
import { render, screen } from '~/tests/render';
import { server } from '~/tests/server.mock';
import { setupRoutes } from '~/tests/setup.tests';
import type { RoutesProps } from '~/tests/setup.tests';

import { errorHandlers, handlers } from './register.handlers';

describe(RegisterPage.name, () => {
  const setupServer = server(handlers);

  beforeAll(() => setupServer.listen());
  afterEach(() => setupServer.resetHandlers());
  afterAll(() => setupServer.close());

  test('should register user correctly', async () => {
    const page = new RegisterObject().render({ initialEntries: ['/register'] });
    await page.fillInputs();

    await page.submit();

    await screen.findByText(/Homepage/i);
  });

  test('should display validation errors', async () => {
    const page = new RegisterObject().render({ initialEntries: ['/register'] });

    await page.submit();

    await screen.findByText(/Invalid email/i);
    await screen.findByText(/String must contain at least 12/i);
  });

  test('should display error if email already taken', async () => {
    setupServer.use(...errorHandlers);

    const page = new RegisterObject().render({ initialEntries: ['/register'] });
    await page.fillInputs();

    await page.submit();

    await screen.findByText(/email has already been taken/i);
  });
});

class RegisterObject {
  render(props?: RoutesProps) {
    const Routes = setupRoutes([
      {
        path: '/register',
        Component: RegisterPage,
        action,
        loader,
      },
      {
        path: '/',
        Component: () => <p>Homepage</p>,
      },
      {
        path: '/organization/:organizationId',
        Component: () => <p>Organization</p>,
      },
    ]);

    render(<Routes {...props} />);

    return this;
  }

  async submit() {
    const { button } = await this.getElements();

    await button.click();

    return this;
  }

  async fillInputs() {
    const { emailInput, passwordInput, captcha } = await this.getElements();

    await emailInput.type('test@gmail.com');
    await passwordInput.type('password123456');
    await captcha.type('12345678901234567890');

    return this;
  }

  async getElements() {
    const button = await ButtonHandle.fromRole();
    const emailInput = await InputHandle.fromLabelText(/email/i);
    const passwordInput = await InputHandle.fromLabelText(/password/i);
    const captcha = await InputHandle.fromTestId('mock-v2-captcha-element');

    return { button, emailInput, passwordInput, captcha };
  }
}
