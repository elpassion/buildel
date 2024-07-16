import userEvent from '@testing-library/user-event';

import { screen } from '../render';
import type { Matcher } from '../render';

export class LinkHandle {
  constructor(public readonly linkElement: HTMLButtonElement) {}

  static async fromRole(name?: string): Promise<LinkHandle> {
    return new LinkHandle(await screen.findByRole('link', { name }));
  }

  static async fromLabelText(label: Matcher): Promise<LinkHandle> {
    return new LinkHandle(await screen.findByLabelText(label));
  }

  async click() {
    await userEvent.click(this.linkElement);
  }
}
