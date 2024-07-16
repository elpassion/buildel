import userEvent from '@testing-library/user-event';

import { screen } from '../render';
import type { Matcher } from '../render';

export class RadioHandle {
  constructor(public readonly radioElement: HTMLInputElement) {}

  static async fromLabelText(label: Matcher): Promise<RadioHandle> {
    return new RadioHandle(await screen.findByLabelText(label));
  }

  static async fromRole(name?: string): Promise<RadioHandle> {
    return new RadioHandle(await screen.findByRole('radio', { name }));
  }

  isDisabled(): boolean {
    return this.radioElement.hasAttribute('disabled');
  }

  isChecked(): boolean {
    return this.radioElement.checked;
  }

  async click() {
    if (this.isDisabled()) {
      throw new Error(`(${this.radioElement.name}) is disabled!`);
    }

    await userEvent.click(this.radioElement);
  }
}
