defmodule Buildel.DocumentWorkflow do
  def process(document) do
    # file ie. document.pdf
    document
    # get the content of the file (chunked) [Header{level: 0, metadata: {page: 0}}, Paragraph{level: 1}, Paragraph{level: 1}, ListItem{level: 2, metadata: {page: 1}}]
    |> read
    # build nodes with relations to other nodes (parent?, next?, previous?)
    |> build_relations
    # 1500 characters per chunk keeping metadata  "#Zał 3. ##Pasywa, ###coś tam, ####dobra trwałe\n maszyny coś tam..."
    |> build_node_chunks
    # { "zał 3" => [id_chunku, id_chunku_2], "pasywa" => [chunk_3], "coś tam" => [], "dobra trwałe" =>[], "maszyny coś tam" => [] }
    |> generate_keyword_nodes
    # generate embeddings for each chunk
    |> generate_embeddings_for_chunks
    # save the chunk with embeddings in database
    |> put_in_database

    # document
    # |> read ("abc cde\n\n fgh\n ijk\n listitem\n")
    # |> build_node_chunks (["abc cde\n\n", "fgh\n ijk\n listitem\n"])
    # |> generate_embeddings_for_chunks ([{embeddings: [...], chunk: "abc cde\n\n"}, {embeddings: [...], chunk: "fgh\n ijk\n listitem\n"}])
    # |> put_in_database ([{embeddings: [...], chunk: "abc cde\n\n"}, {embeddings: [...], chunk: "fgh\n ijk\n listitem\n"}])
  end

  defp read(_document) do
    []
  end

  defp build_relations(_document) do
    []
  end

  defp build_node_chunks(_document) do
    []
  end

  defp generate_keyword_nodes(_document) do
    []
  end

  defp generate_embeddings_for_chunks(_document) do
    []
  end

  defp put_in_database(_document) do
    []
  end

  defp generate_embeddings_for_chunks(_document) do
    []
  end
end
