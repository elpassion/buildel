import userEvent from "@testing-library/user-event";
import { screen } from "../render";

export class ButtonHandle {
  constructor(public readonly buttonElement: HTMLButtonElement) {}

  static fromRole(name?: string): ButtonHandle {
    return new ButtonHandle(screen.getByRole("button", { name }));
  }
  isDisabled(): boolean {
    return this.buttonElement.hasAttribute("disabled");
  }

  async click() {
    if (this.isDisabled()) {
      throw new Error(`(${this.buttonElement.name}) button is disabled!`);
    }

    await userEvent.click(this.buttonElement);
  }
}
