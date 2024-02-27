import userEvent from "@testing-library/user-event";
import { screen, Matcher } from "../render";

export class FileInputHandle {
  constructor(public readonly fileInputElement: HTMLInputElement) {}

  static async fromLabelText(label: Matcher): Promise<FileInputHandle> {
    return new FileInputHandle(await screen.findByLabelText(label));
  }

  static async fromTestId(testId: string): Promise<FileInputHandle> {
    return new FileInputHandle(await screen.findByTestId(testId));
  }

  static async fromRole(name?: string): Promise<FileInputHandle> {
    return new FileInputHandle(await screen.findByRole("textbox", { name }));
  }

  isDisabled(): boolean {
    return this.fileInputElement.hasAttribute("disabled");
  }

  async upload(file: File | File[]) {
    if (this.isDisabled()) {
      throw new Error(`(${this.fileInputElement.name}) input is disabled!`);
    }

    await userEvent.upload(this.fileInputElement, file);
  }

  get value() {
    return this.fileInputElement.value;
  }
}
