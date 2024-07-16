import userEvent from '@testing-library/user-event';

import { screen } from '../render';

export class TextareaHandle {
  constructor(public readonly textareaElement: HTMLTextAreaElement) {}

  static async fromTestId(testId: string): Promise<TextareaHandle> {
    return new TextareaHandle(await screen.findByTestId(testId));
  }

  isDisabled(): boolean {
    return this.textareaElement.hasAttribute('disabled');
  }

  async type(text: string) {
    if (this.isDisabled()) {
      throw new Error(`(${this.textareaElement.name}) textarea is disabled!`);
    }

    await userEvent.type(this.textareaElement, text);
  }

  async paste(text: string) {
    if (this.isDisabled()) {
      throw new Error(`(${this.textareaElement.name}) textarea is disabled!`);
    }

    await userEvent.clear(this.textareaElement);
    await userEvent.click(this.textareaElement);
    await userEvent.paste(text);
  }

  get value() {
    return this.textareaElement.value;
  }
}
