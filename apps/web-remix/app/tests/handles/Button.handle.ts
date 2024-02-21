import userEvent from "@testing-library/user-event";
import { screen, Matcher } from "../render";

export class ButtonHandle {
  constructor(public readonly buttonElement: HTMLButtonElement) {}

  static async fromRole(name?: string): Promise<ButtonHandle> {
    return new ButtonHandle(await screen.findByRole("button", { name }));
  }

  static async fromLabelText(label: Matcher): Promise<ButtonHandle> {
    return new ButtonHandle(await screen.findByLabelText(label));
  }

  static async fromTestId(testId: Matcher): Promise<ButtonHandle> {
    return new ButtonHandle(await screen.findByTestId(testId));
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
