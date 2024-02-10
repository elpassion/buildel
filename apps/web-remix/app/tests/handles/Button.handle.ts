import userEvent from "@testing-library/user-event";
import { screen } from "../render";

export class ButtonHandle {
  constructor(public readonly buttonElement: HTMLButtonElement) {}

  static async fromRole(name?: string): Promise<ButtonHandle> {
    return new ButtonHandle(await screen.findByRole("button", { name }));
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
