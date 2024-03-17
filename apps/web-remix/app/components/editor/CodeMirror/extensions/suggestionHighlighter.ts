import {
  Decoration,
  EditorView,
  RangeSet,
  RangeSetBuilder,
  ViewPlugin,
  ViewUpdate,
} from "@uiw/react-codemirror";

export const suggestionHighlighter = (suggestions: string[]) =>
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
  suggestions: string[]
): RangeSet<Decoration> {
  let builder = new RangeSetBuilder();

  for (let { from, to } of view.visibleRanges) {
    let text = view.state.doc.sliceString(from, to);
    let regex = /\{\{(.*?)\}\}/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const startPos = from + match.index;
      const endPos = startPos + match[0].length;

      const className = suggestions.includes(match[1])
        ? "valid-suggestion"
        : "invalid-suggestion";

      const deco = Decoration.mark({ class: className });

      builder.add(startPos, endPos, deco);
    }
  }

  return builder.finish() as RangeSet<Decoration>;
}
