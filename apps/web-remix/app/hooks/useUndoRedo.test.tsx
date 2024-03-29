import { test, describe, expect, beforeEach } from "vitest";
import { renderHook, act } from "~/tests/render";
import { useUndoRedo } from "~/hooks/useUndoRedo";
describe("useUndoRedo", () => {
  let result: any;

  beforeEach(async () => {
    const hook = renderHook(() => useUndoRedo({ initial: "first" }));
    result = hook.result;
  });

  test("should correctly initialize state with 'first' and no history", () => {
    const [state, _, { prev, next, allowRedo, allowUndo }] = result.current;

    expect(state).toBe("first");
    expect(allowRedo).toBe(false);
    expect(allowUndo).toBe(false);
    expect(prev).toEqual([]);
    expect(next).toEqual([]);
  });

  test("should correctly push element to the history and update state", async () => {
    await act(async () => {
      result.current[1]("second");
    });

    const [state, _, { allowRedo, allowUndo, prev, next }] = result.current;

    expect(state).toBe("second");
    expect(allowRedo).toBe(false);
    expect(allowUndo).toBe(true);
    expect(prev).toEqual(["first"]);
    expect(next).toEqual([]);
  });

  describe("undo/redo functionality", () => {
    beforeEach(async () => {
      await act(async () => {
        result.current[1]("second");
      });
    });

    test("should handle undo correctly", async () => {
      await act(async () => {
        result.current[2].undo();
      });

      const [state, _, { allowRedo, allowUndo, prev, next }] = result.current;

      expect(state).toBe("first");
      expect(allowRedo).toBe(true);
      expect(allowUndo).toBe(false);
      expect(prev).toEqual([]);
      expect(next).toEqual(["second"]);
    });

    test("should handle redo correctly after undo", async () => {
      await act(async () => {
        result.current[2].undo();
      });

      await act(async () => {
        result.current[2].redo();
      });

      const [state, _, { allowRedo, allowUndo, prev, next }] = result.current;

      expect(state).toBe("second");
      expect(allowRedo).toBe(false);
      expect(allowUndo).toBe(true);
      expect(prev).toEqual(["first"]);
      expect(next).toEqual([]);
    });
  });
});
