import { useCallback, useReducer } from "react";
import isEqual from "lodash.isequal";

type Action<T> =
  | { type: "SET"; payload: { data: ((state: T) => T) | T; ignore: boolean } }
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
      if (action.payload.ignore) return { ...state, curr: newCurr };

      return {
        prev: [...state.prev, state.curr],
        curr: newCurr,
        next: [],
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
  }
};

export const useUndoRedo = <T,>(initial: T) => {
  const [state, dispatch] = useReducer(reducer<T>, {
    prev: [],
    curr: initial,
    next: [],
  });

  const undo = useCallback(() => {
    dispatch({ type: "UNDO" });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: "REDO" });
  }, []);

  const set = useCallback((cb: ((oldState: T) => T) | T, ignore = false) => {
    dispatch({ type: "SET", payload: { data: cb, ignore } });
  }, []);

  return {
    allowUndo: state.prev.length > 0,
    allowRedo: state.next.length > 0,
    history: state.curr,
    setHistory: set,
    undo,
    redo,
  };
};
