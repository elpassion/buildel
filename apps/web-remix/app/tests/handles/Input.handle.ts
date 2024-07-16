import userEvent from '@testing-library/user-event';

import { findByLabelText, screen } from '../render';
import type { Matcher } from '../render';

export class InputHandle {
  constructor(public readonly inputElement: HTMLInputElement) {}

  static async fromLabelText(label: Matcher): Promise<InputHandle> {
    return new InputHandle(await screen.findByLabelText(label));
  }

  static async fromLabelTextAndContainer(
    label: Matcher,
    container: HTMLElement,
  ): Promise<InputHandle> {
    return new InputHandle(await findByLabelText(container, label));
  }

  static async fromTestId(testId: string): Promise<InputHandle> {
    return new InputHandle(await screen.findByTestId(testId));
  }

  static async fromRole(name?: string): Promise<InputHandle> {
    return new InputHandle(await screen.findByRole('textbox', { name }));
  }

  isDisabled(): boolean {
    return this.inputElement.hasAttribute('disabled');
  }

  async type(text: string) {
    if (this.isDisabled()) {
      throw new Error(`(${this.inputElement.name}) input is disabled!`);
    }

    await userEvent.type(this.inputElement, text);
  }

  async clear() {
    if (this.isDisabled()) {
      throw new Error(`(${this.inputElement.name}) input is disabled!`);
    }

    await userEvent.clear(this.inputElement);
  }

  get value() {
    return this.inputElement.value;
  }
}
