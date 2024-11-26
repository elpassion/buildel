type BaseOutput = {
  isCompleted: boolean;
  type: string;
  name: string;
};

export type TextOutput = BaseOutput & {
  value?: string;
  metadata?: Record<string, any>;
};

export type FileOutput = BaseOutput & {
  value?: Blob;
  metadata?: {
    file_name?: string;
    file_type?: string;
    file_size?: number;
  };
};

export type Output = TextOutput | FileOutput;

export type FormInterfaceState = {
  outputs: Record<string, Output>;
  isWaitingForOutputs: boolean;
};

export type FormInterfaceAction =
  | {
      type: 'SET_OUTPUT';
      payload: { name: string; value: any; metadata?: Record<string, any> };
    }
  | {
      type: 'SET_STATUS';
      payload: { name: string; status: boolean };
    }
  | {
      type: 'DONE';
    }
  | {
      type: 'GENERATE';
    };

export function formInterfaceReducer(
  state: FormInterfaceState,
  action: FormInterfaceAction,
) {
  switch (action.type) {
    case 'SET_OUTPUT':
      return {
        ...state,
        outputs: {
          ...state.outputs,
          [action.payload.name]: {
            ...state.outputs[action.payload.name],
            value: action.payload.value,
            metadata: action.payload.metadata,
          },
        },
      };
    case 'SET_STATUS':
      const result = {
        ...state.outputs,
        [action.payload.name]: {
          ...state.outputs[action.payload.name],
          isCompleted: action.payload.status,
        },
      };
      return {
        ...state,
        outputs: result,
        isWaitingForOutputs: Object.values(result).some(
          (value) => value.isCompleted,
        ),
      };

    case 'DONE':
      return {
        ...state,
        isWaitingForOutputs: false,
      };

    case 'GENERATE':
      return {
        ...state,
        outputs: Object.keys(state.outputs).reduce(
          (acc, key) => {
            acc[key] = {
              isCompleted: false,
              type: state.outputs[key].type,
              name: state.outputs[key].name,
            };
            return acc;
          },
          {} as Record<string, Output>,
        ),
        isWaitingForOutputs: true,
      };

    default:
      return state;
  }
}

export function setOutput(
  name: string,
  value: Output['value'],
  metadata?: Record<string, any>,
) {
  return {
    type: 'SET_OUTPUT' as const,
    payload: { name, value, metadata },
  };
}

export function setStatus(name: string, status: boolean) {
  return {
    type: 'SET_STATUS' as const,
    payload: { name, status },
  };
}

export function generate() {
  return { type: 'GENERATE' as const };
}

export function done() {
  return { type: 'DONE' as const };
}
