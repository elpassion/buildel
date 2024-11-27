import {
  FieldArray as FA,
  useControlField as ucf,
  useField as uf,
  useFieldArray as ufa,
} from '@rvf/remix';

export const useControlField = ucf;
export const useField = uf;

export const FieldArray = FA;
export const useFieldArray = ufa;
export type ValidationBehaviorOptions = any; // Define your validation behavior options here
