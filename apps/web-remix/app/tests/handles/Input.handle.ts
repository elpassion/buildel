import userEvent from "@testing-library/user-event";
import { screen, Matcher } from "../render";

export class InputHandle {
  constructor(public readonly inputElement: HTMLInputElement) {}

  static fromRole(name?: string): InputHandle {
    return new InputHandle(screen.getByRole("textbox", { name }));
  }

  static fromLabelText(label: Matcher): InputHandle {
    return new InputHandle(screen.getByLabelText(label));
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
