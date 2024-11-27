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
  formErrors: Record<string, string[]>;
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
      type: 'FINISH';
    }
  | {
      type: 'SET_ERRORS';
      payload: Record<string, string[]>;
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
      const errors = { ...state.formErrors };
      delete errors[action.payload.name];

      return {
        ...state,
        formErrors: errors,
        formValues: {
          ...state.formValues,
          [action.payload.name]: action.payload.value,
        },
      };
    case 'FINISH':
      return { ...state, isSubmitting: false };
    case 'CLEAR_PROPERTY':
      return {
        ...state,
        formValues: {
          ...state.formValues,
          [action.payload.name]: undefined,
        },
      };
    case 'SET_ERRORS':
      return {
        ...state,
        formErrors: action.payload,
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
    formErrors: {},
  });

  const validate = () => {
    const errors: Record<string, string[]> = {};
    Object.entries(state.formValues).forEach(([key, value]) => {
      if (!value) {
        errors[key] = ['This field is required'];
      }
    });

    dispatch({ type: 'SET_ERRORS', payload: errors });

    return errors;
  };

  const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (Object.keys(validate()).length > 0) {
      return;
    }

    dispatch({ type: 'SUBMIT' });

    await onSubmit?.(state.formValues, e);

    dispatch({ type: 'FINISH' });
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
      errors: state.formErrors[name],
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
  }, [state.formValues[name], state.formErrors[name], dispatch]);
}
