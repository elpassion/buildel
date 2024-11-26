import React, { use, useMemo, useReducer } from 'react';

type PropertyValue =
  | File
  | File[]
  | string
  | number
  | boolean
  | null
  | undefined;

type State = {
  formValues: {
    [key: string]: PropertyValue;
  };

  isSubmitting?: boolean;
};

type Action =
  | {
      type: 'SET_PROPERTY';
      payload: {
        name: string;
        value: PropertyValue;
      };
    }
  | {
      type: 'CLEAR_FORM';
    }
  | {
      type: 'CLEAR_PROPERTY';
      payload: {
        name: string;
      };
    }
  | {
      type: 'SUBMIT';
    };

function formReducer(state: State, action: Action) {
  switch (action.type) {
    case 'SET_PROPERTY':
      return {
        ...state,
        formValues: {
          ...state.formValues,
          [action.payload.name]: action.payload.value,
        },
      };
    case 'CLEAR_FORM':
      return { ...state, isSubmitting: false, formValues: {} };
    case 'CLEAR_PROPERTY':
      return {
        ...state,
        formValues: {
          ...state.formValues,
          [action.payload.name]: undefined,
        },
      };
    case 'SUBMIT':
      return {
        ...state,
        isSubmitting: true,
      };
    default:
      return state;
  }
}

export const FormContext = React.createContext<{
  state: State;
  dispatch: React.ActionDispatch<[Action]>;
}>(undefined!);

export function useForm({
  defaultValues,
  onSubmit,
}: {
  defaultValues?: State['formValues'];
  onSubmit?: (
    data: State['formValues'],
    e: React.FormEvent<HTMLFormElement>,
  ) => void | Promise<void>;
}) {
  const [state, dispatch] = useReducer<State, [Action]>(formReducer, {
    isSubmitting: false,
    formValues: defaultValues ?? {},
  });

  const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    dispatch({ type: 'SUBMIT' });

    await onSubmit?.(state.formValues, e);

    dispatch({ type: 'CLEAR_FORM' });
  };

  return {
    state,
    dispatch,
    onSubmit: handleOnSubmit,
  };
}

export function useFormField<T extends PropertyValue = string>(name: string) {
  const ctx = use(FormContext);

  if (!ctx) {
    throw new Error('useFormField must be used within a FormContext');
  }

  const { state, dispatch } = ctx;

  return useMemo(() => {
    return {
      value: state.formValues[name] as T,
      setValue: (value: T) => {
        dispatch({
          type: 'SET_PROPERTY',
          payload: {
            name,
            value,
          },
        });
      },
      clear: () => {
        dispatch({
          type: 'CLEAR_PROPERTY',
          payload: {
            name,
          },
        });
      },
    };
  }, [state.formValues[name], dispatch]);
}
