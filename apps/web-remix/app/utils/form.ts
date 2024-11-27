import { withZod as wz } from '@remix-validated-form/with-zod';
import {
  useFormContext as ufc,
  ValidatedForm as VF,
} from 'remix-validated-form';

export const withZod = wz;
export const ValidatedForm = VF;
export const useFormContext = ufc;
