import React from "react";
import { vi } from "vitest";
import { EditorProps } from "@monaco-editor/react";

vi.mock("@monaco-editor/react", () => ({
  Editor: (props: EditorProps) => {
    return (
      <textarea
        data-testid={`${props.path}-editor`}
        onChange={(e) => props.onChange?.(e.target.value, null as any)}
        value={props.value}
      ></textarea>
    );
  },
  useMonaco: vi.fn(),
}));
