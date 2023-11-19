defmodule Buildel.Clients.Functions.HybridDB do
  alias LangChain.Function

  def new() do
    Function.new(%{
      name: "query",
      description:
        "Accepts search query. Break down complex questions into sub-questions. Split queries if ResponseTooLargeError occurs.",
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
    Buildel.HybridDB.query(context.knowledge, query)
    |> Enum.take(5)
    |> Enum.map(fn %{
                     "document" => document,
                     "metadata" => %{"file_name" => filename}
                   } ->
      "File: #{filename}\n\n#{document |> String.trim()}"
    end)
    |> Enum.join("\n\n---\n\n")
  end
end
