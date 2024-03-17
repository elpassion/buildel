import {
  Decoration,
  EditorView,
  RangeSet,
  RangeSetBuilder,
  ViewPlugin,
  ViewUpdate,
} from "@uiw/react-codemirror";
import { Suggestion } from "../codeMirror.types";

export const suggestionHighlighter = (suggestions: Suggestion[]) =>
  ViewPlugin.fromClass(
    class {
      decorations;

      constructor(view: EditorView) {
        this.decorations = suggestionDecorations(view, suggestions);
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = suggestionDecorations(update.view, suggestions);
        }
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  );

function suggestionDecorations(
  view: EditorView,
  suggestions: Suggestion[]
): RangeSet<Decoration> {
  let builder = new RangeSetBuilder();

  for (let { from, to } of view.visibleRanges) {
    let text = view.state.doc.sliceString(from, to);
    let regex = /\{\{(.*?)\}\}/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const startPos = from + match.index;
      const endPos = startPos + match[0].length;

      const current = suggestions.find((sug) => sug.label === match![1]);
      const className = current
        ? `valid-suggestion-${current.variant}`
        : "invalid-suggestion";

      const deco = Decoration.mark({ class: className });

      builder.add(startPos, endPos, deco);
    }
  }

  return builder.finish() as RangeSet<Decoration>;
}
