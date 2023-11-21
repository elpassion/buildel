defmodule Buildel.Clients.Functions.HybridDB do
  alias LangChain.Function

  def new() do
    Function.new(%{
      name: "query",
      description:
        "Search through documents and find text chunks from related to the query. If you want to read the whole document a chunk comes from, use the `documents` function.",
      parameters_schema: %{
        type: "object",
        properties: %{
          query: %{
            type: "string",
            description: "The query to search for."
          }
        },
        required: ["query"]
      },
      function: &execute/2
    })
  end

  def new!() do
    case new() do
      {:ok, function} ->
        function

      {:error, changeset} ->
        raise LangChain.LangChainError, changeset
    end
  end

  defp execute(%{"query" => query} = _args, context) do
    Buildel.VectorDB.query(context.knowledge, query, api_key: api_key())
    |> Enum.take(3)
    |> Enum.map(fn %{
                     "document" => document,
                     "metadata" => %{"file_name" => filename, "memory_id" => memory_id}
                   } ->
      %{
        document_id: memory_id,
        document_name: filename,
        chunk: document |> String.trim()
      }
    end)
    |> Jason.encode!()
  end

  defp api_key do
    System.fetch_env!("OPENAI_API_KEY")
  end
end
