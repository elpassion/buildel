defmodule Buildel.Clients.Functions.MemoriesDB do
  alias LangChain.Function

  def new() do
    Function.new(%{
      name: "documaents",
      description: "Retrieve full document by id.",
      parameters_schema: %{
        type: "object",
        properties: %{
          document_id: %{
            type: "number",
            description: "Document id"
          }
        },
        required: ["document_id"]
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

  defp execute(%{"document_id" => document_id} = _args, context) do
    memory = Buildel.Memories.get_memory!(document_id)
    "Document name: #{memory.file_name}\n\n#{memory.content |> String.trim()}"
  end
end
