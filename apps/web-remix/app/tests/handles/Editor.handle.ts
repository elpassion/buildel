import userEvent from "@testing-library/user-event";
import { screen } from "../render";

export class EditorHandle {
  constructor(public readonly editorElement: HTMLTextAreaElement) {}

  static async fromTestId(testId: string): Promise<EditorHandle> {
    return new EditorHandle(await screen.findByTestId(testId + "-editor"));
  }

  isDisabled(): boolean {
    return this.editorElement.hasAttribute("disabled");
  }

  async type(text: string) {
    if (this.isDisabled()) {
      throw new Error(`(${this.editorElement.name}) textarea is disabled!`);
    }

    await userEvent.type(this.editorElement, text);
  }

  async paste(text: string) {
    if (this.isDisabled()) {
      throw new Error(`(${this.editorElement.name}) textarea is disabled!`);
    }

    await userEvent.clear(this.editorElement);
    await userEvent.click(this.editorElement);
    await userEvent.paste(text);
  }

  get value() {
    return this.editorElement.value;
  }
}
