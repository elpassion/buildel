import {
  FieldArray as FA,
  useControlField as ucf,
  useField as uf,
  useFieldArray as ufa,
} from 'remix-validated-form';
import type { ValidationBehaviorOptions as VBO } from 'remix-validated-form/browser/internal/getInputProps';

export const useControlField = ucf;
export const useField = uf;

export const FieldArray = FA;
export const useFieldArray = ufa;
export type ValidationBehaviorOptions = VBO;
