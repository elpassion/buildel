import type { CompletionContext } from '@codemirror/autocomplete';

import type { Suggestion } from '../codeMirror.types';

export function completions(
  context: CompletionContext,
  suggestions: Suggestion[],
) {
  let word = context.matchBefore(/\w*/);

  if (!word) return null;
  if (word.from == word.to && !context.explicit) return null;

  const textBefore = context.state.sliceDoc(0, word.from);
  const textAfter = context.state.sliceDoc(word.to);

  const alreadyHasDoubleBraces =
    textBefore.endsWith('{{') && textAfter.startsWith('}}');
  const alreadyHasBraces =
    textBefore.endsWith('{') && textAfter.startsWith('}');

  return {
    from: word.from,
    options: suggestions.map((completion) => {
      const apply = alreadyHasDoubleBraces
        ? completion.label
        : alreadyHasBraces
          ? `{${completion.label}}`
          : `{{${completion.label}}}`;

      return {
        label: completion.label,
        type: completion.type,
        info: completion.info,
        apply: apply,
      };
    }),
  };
}
