import { useEffect, useMemo, useState } from 'react';
import type {
  FieldArrayApi as FAI,
  FieldApi as FApi,
  FormApi as FoApi,
  FormScope as FS,
  ValidationBehaviorConfig,
} from '@rvf/remix';
import {
  FieldArray as FA,
  useControlField as ucf,
  useField as uf,
  useFieldArray as ufa,
  useFormScopeOrContext as ufsc,
} from '@rvf/remix';

import { useFormContext } from '~/utils/form';

export const useControlField = ucf;
export const useField = uf;

export const useFormScopeOrContext = ufsc;
export const FieldArray = FA;
export const useFieldArray = ufa;
export type ValidationBehaviorOptions = ValidationBehaviorConfig; // Define your validation behavior options here
export type FieldArrayApi<T extends any[]> = FAI<T>;
export type FieldApi<T> = FApi<T>;
export type FormApi<T> = FoApi<T>;
export type FormScope<T> = FS<T>;

export const useCurrentFormState = () => {
  const {
    subscribe,
    formState: { fieldErrors },
  } = useFormContext();
  const form = useFormScopeOrContext();
  const [values, setValues] = useState<any>(form.transient.value() ?? {});

  useEffect(() => {
    subscribe.value((values) => setValues(values));
  }, []);

  return useMemo(() => {
    return { values, subscribe, fieldErrors, getValues: () => values };
  }, [values, subscribe, fieldErrors]);
};

export function useSubscribeToField(
  defaultWhen: Record<string, Record<string, string>> | undefined,
  onUpdate: (value: string) => void,
) {
  const { subscribe } = useCurrentFormState();

  useEffect(() => {
    if (!defaultWhen) return;
    Object.keys(defaultWhen).forEach((key) => {
      //eslint-disable-next-line
      //@ts-ignore
      subscribe.value(key, (data) => {
        const value = defaultWhen[key][data];

        if (value) {
          onUpdate(value);
        }
      });
    });
  }, [defaultWhen]);
}
