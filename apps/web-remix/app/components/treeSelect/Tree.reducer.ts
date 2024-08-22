import type { TreeModel } from './TreeModel';

type Action<T> = {
  type: 'SET_MODEL';
  payload: TreeModel<T>;
};

type State<T> = {
  model: TreeModel<T>;
};

export const treeReducer = <T>(state: State<T>, action: Action<T>) => {
  switch (action.type) {
    case 'SET_MODEL':
      return { ...state, model: action.payload };
    default:
      return state;
  }
};
