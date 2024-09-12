defmodule Buildel.Blocks.Rerank do
  use Buildel.Blocks.Block

  # Config

  @impl true
  def options() do
    %{
      type: "rerank",
      description: "Used for reranking a list based on relevance to a given query.",
      groups: ["text"],
      inputs: [
        Block.text_input("query"),
        Block.text_input("documents")
      ],
      outputs: [Block.text_output("reranked_documents")],
      ios: [],
      dynamic_ios: nil,
      schema: schema()
    }
  end

  @impl true
  def schema() do
    %{
      "type" => "object",
      "required" => ["name", "opts"],
      "properties" => %{
        "name" => name_schema(),
        "inputs" => inputs_schema(),
        "opts" =>
          options_schema(%{
            "required" => ["api_type", "api_key", "model", "top_n"],
            "properties" =>
              Jason.OrderedObject.new(
                api_type: %{
                  "type" => "string",
                  "title" => "Model API type",
                  "description" => "The API type to use for the rerank model.",
                  "enum" => ["cohere"],
                  "enumPresentAs" => "radio",
                  "default" => "cohere",
                  "readonly" => true
                },
                api_key:
                  secret_schema(%{
                    "title" => "API key",
                    "description" => "API key to use for the rerank model.",
                    "descriptionWhen" => %{
                      "opts.api_type" => %{
                        "cohere" =>
                          "[Cohere API key](https://dashboard.cohere.com/api-keys) to use for the rerank."
                      }
                    },
                    "defaultWhen" => %{
                      "opts.api_type" => %{
                        "cohere" => "__cohere"
                      }
                    }
                  }),
                model: %{
                  "type" => "string",
                  "title" => "Model",
                  "description" => "The rerank model.",
                  "enum" => [
                    "rerank-english-v3.0",
                    "rerank-multilingual-v3.0",
                    "rerank-english-v2.0",
                    "rerank-multilingual-v2.0"
                  ],
                  "enumPresentAs" => "radio",
                  "default" => "rerank-english-v3.0",
                  "readonly" => true
                },
                top_n: %{
                  "type" => "number",
                  "title" => "Number of results",
                  "description" => "Number of results to return after reranking.",
                  "default" => 10,
                  "readonly" => true,
                  "minimum" => 1,
                  "step" => 1
                }
              )
          })
      }
    }
  end

  # Server

  @impl true
  def setup(%{opts: opts, context_id: context_id} = state) do
    api_key = block_context().get_secret_from_context(context_id, opts.api_key)

    {:ok,
     state
     |> save_query(nil)
     |> save_documents(nil)
     |> Map.put(
       :api_key,
       api_key
     )}
  end

  @impl true
  def handle_input("query", {_topic, :text, query, _metadata}, state) do
    state
    |> save_query(query)
    |> try_rerank()
  end

  @impl true
  def handle_input("documents", {_topic, :text, documents, _metadata}, state) do
    state
    |> save_documents(documents)
    |> try_rerank()
  end

  defp save_query(state, query) do
    state |> Map.put(:query, query)
  end

  defp save_documents(state, nil) do
    state |> Map.put(:documents, nil)
  end

  defp save_documents(state, documents) do
    case documents |> Jason.decode() do
      {:ok, documents} ->
        state |> Map.put(:documents, documents)

      {:error, _} ->
        state |> send_error("Invalid documents. Ensure documents are a list of strings.")
    end
  end

  defp try_rerank(%{query: query, documents: documents} = state)
       when is_nil(query) or is_nil(documents) do
    state
  end

  defp try_rerank(%{query: query, documents: documents} = state) do
    client = Buildel.Clients.Rerank.new(state.opts.api_type, %{api_key: state.api_key})

    params =
      Buildel.Clients.Rerank.Params.new(%{
        inputs: documents,
        model: state.opts.model,
        query: query,
        top_n: state.opts.top_n
      })

    state = send_stream_start(state, "reranked_documents")

    case Buildel.Clients.Rerank.rerank(client, params) do
      {:ok, results} ->
        output(state, "reranked_documents", {:text, results |> Jason.encode!()})
        |> save_documents(nil)
        |> save_query(nil)

      {:error, reason} ->
        send_error(state, reason |> to_string()) |> send_stream_stop("reranked_documents")
    end
  end
end
