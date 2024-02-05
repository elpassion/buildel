export function isTypeOf<T>(property: keyof T, value: any): value is T {
  return value !== undefined && (value as T)[property] !== undefined;
}

export const isNotNil = <T>(v: T | null | undefined): v is T =>
  v !== null && v !== undefined;
