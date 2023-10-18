export function isTypeOf<T>(property: keyof T, value: any): value is T {
  return value !== undefined && (value as T)[property] !== undefined;
}
