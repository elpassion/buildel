import type { CompletionContext } from '@codemirror/autocomplete';

import type { Suggestion } from '../codeMirror.types';

export function completions(
  context: CompletionContext,
  suggestions: Suggestion[],
) {
  let word = context.matchBefore(/\w*/);

  if (!word) return null;
  if (word.from == word.to && !context.explicit) return null;

  return {
    from: word.from,
    options: suggestions.map((completion) => ({
      label: completion.label,
      type: completion.type,
      info: completion.info,
      apply: `{{${completion.label}}}`,
    })),
  };
}
