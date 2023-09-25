defmodule Buildel.Splitters do
  require Logger

  def recursive_character_text_split(
        text,
        %{} = opts
      ) do
    opts =
      Map.merge(%{chunk_size: 1000, chunk_overlap: 0, separators: ["\n\n", "\n", " ", ""]}, opts)

    separator =
      Enum.reduce_while(opts.separators ++ [""], Enum.at(opts.separators, -1), fn separator,
                                                                                  last_separator ->
        if String.contains?(text, separator) do
          {:halt, separator}
        else
          {:cont, last_separator}
        end
      end)

    {final_chunks, good_splits} =
      text
      |> String.split(separator, trim: true)
      |> Enum.reduce({[], []}, fn split, {final_chunks, good_splits} ->
        if String.length(split) <= opts.chunk_size do
          {final_chunks, good_splits ++ [split]}
        else
          final_chunks =
            if good_splits |> Enum.empty?() do
              final_chunks
            else
              final_chunks ++
                merge_splits(good_splits, %{
                  chunk_size: opts.chunk_size,
                  chunk_overlap: opts.chunk_overlap,
                  separator: separator
                })
            end

          final_chunks = final_chunks ++ recursive_character_text_split(split, opts)
          {final_chunks, []}
        end
      end)

    if good_splits |> Enum.empty?(),
      do: final_chunks,
      else:
        final_chunks ++
          merge_splits(good_splits, %{
            chunk_size: opts.chunk_size,
            chunk_overlap: opts.chunk_overlap,
            separator: separator
          })
  end

  defp merge_splits(splits, opts) do
    {docs, current_doc, _total} =
      Enum.reduce(splits, {[], [], 0}, fn split, {docs, current_doc, total} ->
        length = String.length(split)

        if total + length >= opts.chunk_size && Enum.count(current_doc) > 0 do
          docs = docs ++ [join_splits(current_doc, opts.separator)]

          {current_doc, total} =
            Enum.reduce_while(current_doc, {current_doc, total}, fn _, {current_doc, total} ->
              if total > opts.chunk_overlap or (total + length > opts.chunk_size and total > 0) do
                {dropped_element, current_doc} = current_doc |> List.pop_at(0)
                {:cont, {current_doc, total - String.length(dropped_element)}}
              else
                {:halt, {current_doc, total}}
              end
            end)

          {docs, current_doc ++ [split], total + length}
        else
          {docs, current_doc ++ [split], total + length}
        end
      end)

    docs ++ [join_splits(current_doc, opts.separator)]
  end

  defp join_splits(splits, separator) do
    Enum.join(splits, separator)
  end
end
