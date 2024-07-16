import { screen } from "../render";
import type { Matcher } from "../render";

export class BlockHandle {
  constructor(public readonly blockElement: HTMLDivElement) {}

  static async fromLabelText(label: Matcher): Promise<BlockHandle> {
    return new BlockHandle(await screen.findByLabelText(label));
  }

  static async fromTestId(testId: Matcher): Promise<BlockHandle> {
    return new BlockHandle(await screen.findByTestId(testId));
  }

  get isActive(): boolean {
    return this.blockElement.getAttribute("data-active") === "true";
  }

  get isValid(): boolean {
    return this.blockElement.getAttribute("data-valid") === "true";
  }
}
