import userEvent from "@testing-library/user-event";
import { screen, Matcher } from "../render";

export class InputHandle {
  constructor(public readonly inputElement: HTMLInputElement) {}

  static async fromLabelText(label: Matcher): Promise<InputHandle> {
    return new InputHandle(await screen.findByLabelText(label));
  }

  isDisabled(): boolean {
    return this.inputElement.hasAttribute("disabled");
  }

  async type(text: string) {
    if (this.isDisabled()) {
      throw new Error(`(${this.inputElement.name}) input is disabled!`);
    }

    await userEvent.type(this.inputElement, text);
  }
}
