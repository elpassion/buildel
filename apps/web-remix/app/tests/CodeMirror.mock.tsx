import React from "react";
import { vi } from "vitest";
import { ReactCodeMirrorProps } from "@uiw/react-codemirror";

vi.mock("@uiw/react-codemirror", () => ({
  default: (props: ReactCodeMirrorProps) => {
    return (
      <textarea
        data-testid={props.id}
        onChange={(e) => props.onChange?.(e.target.value, null as any)}
        value={props.value}
      ></textarea>
    );
  },
  EditorView: vi.fn(),
  ViewPlugin: {
    fromClass: vi.fn(),
  },
}));
