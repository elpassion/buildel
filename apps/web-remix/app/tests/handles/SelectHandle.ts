import userEvent from "@testing-library/user-event";
import { screen } from "../render";
import { act } from "~/tests/render";

export class SelectHandle {
  constructor(
    public readonly selectElement: HTMLInputElement,
    private readonly id: string
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

    await act(async () => {
      await userEvent.click(input);
    });

    return this;
  }

  async selectOption(value: string) {
    await this.openSelect();

    const options = await this.getSelectOptions(this.id);

    const option = [...options].find((opt) => opt.title === value);

    if (!option) {
      throw new Error(`There is not ${value} in ${this.id} select`);
    }

    await act(async () => {
      await userEvent.click(option);
    });

    return option;
  }

  get value() {
    return this.getSelectInput().value;
  }

  private getSelectInput() {
    return this.selectElement.querySelector(
      ".rc-select-selection-item"
    ) as HTMLInputElement;
  }
}
