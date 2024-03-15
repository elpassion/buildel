import { useCallback, useReducer } from "react";
import isEqual from "lodash.isequal";

type Action<T> =
  | {
      type: "SET";
      payload: {
        data: ((state: T) => T) | T;
        maxLength: number;
      };
    }
  | {
      type: "UPDATE";
      payload: {
        data: ((state: T) => T) | T;
      };
    }
  | { type: "RESET"; payload: T }
  | { type: "REDO" }
  | { type: "UNDO" };

type State<T> = {
  prev: T[];
  curr: T;
  next: T[];
};

const reducer = <T,>(state: State<T>, action: Action<T>): State<T> => {
  switch (action.type) {
    case "SET":
      const newCurr =
        typeof action.payload.data === "function"
          ? //@ts-ignore
            action.payload.data(state.curr)
          : action.payload.data;

      if (isEqual(state.curr, newCurr)) return state;

      return {
        prev: [...state.prev, state.curr].slice(-action.payload.maxLength),
        curr: newCurr,
        next: [],
      };

    case "UPDATE":
      const curr =
        typeof action.payload.data === "function"
          ? //@ts-ignore
            action.payload.data(state.curr)
          : action.payload.data;

      if (isEqual(state.curr, curr)) return state;

      return {
        ...state,
        curr: curr,
      };
    case "REDO":
      if (state.next.length === 0) return state;

      return {
        prev: [...state.prev, state.curr],
        curr: state.next[0],
        next: state.next.slice(1),
      };
    case "UNDO":
      if (state.prev.length === 0) return state;

      return {
        prev: state.prev.slice(0, state.prev.length - 1),
        curr: state.prev[state.prev.length - 1],
        next: [state.curr, ...state.next],
      };
    case "RESET":
      return { prev: [], curr: action.payload, next: [] };
  }
};

type UseUndoRedoArgs<T> = {
  initial: T;
  maxLength?: number;
};

export const useUndoRedo = <T,>({
  initial,
  maxLength = 30,
}: UseUndoRedoArgs<T>) => {
  const [state, dispatch] = useReducer(reducer<T>, {
    prev: [],
    curr: initial,
    next: [],
  });

  const reset = useCallback(() => {
    dispatch({ type: "RESET", payload: initial });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: "UNDO" });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: "REDO" });
  }, []);

  const set = useCallback((cb: ((oldState: T) => T) | T) => {
    dispatch({ type: "SET", payload: { data: cb, maxLength } });
  }, []);

  const update = useCallback((cb: ((oldState: T) => T) | T) => {
    dispatch({ type: "UPDATE", payload: { data: cb } });
  }, []);

  return [
    state.curr,
    set,
    {
      updateCurrent: update,
      allowUndo: state.prev.length > 0,
      allowRedo: state.next.length > 0,
      reset,
      undo,
      redo,
    },
  ] as const;
};
