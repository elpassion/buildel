import { Matcher, screen } from "~/tests/render";
import userEvent from "@testing-library/user-event/index";

export class ListHandle {
  constructor(public readonly listElement: HTMLUListElement) {}

  static async fromLabelText(label: Matcher): Promise<ListHandle> {
    return new ListHandle(await screen.findByLabelText(label));
  }

  get children() {
    return this.listElement.children;
  }
}
