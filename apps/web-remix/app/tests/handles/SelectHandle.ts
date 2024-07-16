import userEvent from "@testing-library/user-event";
import { ButtonHandle } from "~/tests/handles/Button.handle";
import { screen } from "../render";

export class SelectHandle {
  constructor(
    public readonly selectElement: HTMLInputElement,
    protected readonly id: string
  ) {}

  static async fromTestId(testId: string): Promise<SelectHandle> {
    return new SelectHandle(await screen.findByTestId(testId), testId);
  }

  async getSelectOptions(selectTestId: string) {
    return screen.findAllByTestId(`${selectTestId}-option`);
  }

  async openSelect() {
    const input = this.selectElement.querySelector("input");

    if (!input) throw new Error(`Input in ${this.id} select does not exist`);

    await userEvent.click(input);

    return this;
  }

  async selectOption(value: string) {
    await this.openSelect();

    const options = await this.getSelectOptions(this.id);

    const option = [...options].find((opt) => opt.title === value);

    if (!option) {
      throw new Error(`There is not ${value} in ${this.id} select`);
    }

    await userEvent.click(option);

    return option;
  }

  get value() {
    const input = this.getSelectInput();
    if (!input) return null;

    return input.textContent;
  }

  private getSelectInput() {
    return this.selectElement.querySelector(
      ".rc-select-selection-item"
    ) as HTMLDivElement;
  }
}

export class CreatableSelectHandle extends SelectHandle {
  static async fromTestId(testId: string): Promise<CreatableSelectHandle> {
    return new CreatableSelectHandle(await screen.findByTestId(testId), testId);
  }

  async getAddNewButton() {
    return ButtonHandle.fromTestId(`${this.id}-create-button`);
  }

  async getModal() {
    return screen.findByTestId(`${this.id}-modal`);
  }

  async openModal() {
    const button = await this.getAddNewButton();

    await button.click();

    return this;
  }
}
