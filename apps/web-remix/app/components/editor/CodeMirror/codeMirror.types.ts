export type Suggestion = {
  label: string;
  type?: string;
  info?: string;
  variant?: 'primary' | 'secondary';
  matchAll?: boolean;
};
