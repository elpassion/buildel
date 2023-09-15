defmodule Buildel.Blocks.DocumentSearch do
  use Buildel.Blocks.Block

  # Config

  @impl true
  defdelegate input(pid, chunk), to: __MODULE__, as: :query
  defdelegate text_output(), to: Buildel.Blocks.Block
  defdelegate text_input(name), to: Buildel.Blocks.Block
  defdelegate file_input(name, public), to: Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "document_search",
      inputs: [file_input("files", true), text_input("query")],
      outputs: [text_output()],
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
            "required" => ["api_key", "persist_in"],
            "properties" => %{
              "api_key" => %{
                "type" => "string",
                "title" => "API Key",
                "description" => "OpenAI Api key",
                "minLength" => 1,
                "presentAs" => "password"
              },
              "persist_in" => %{
                "type" => "string",
                "title" => "Persist in",
                "enum" => ["run", "workflow"],
                "enumPresentAs" => "radio",
                "description" =>
                  "Where to hold data from inputs. Can be 'run' - resetting for every run of workflow, 'workflow' - persisted across runs.",
                "default" => "run"
              }
            }
          })
      }
    }
  end

  # Client

  def query(pid, {:text, _text} = text) do
    GenServer.cast(pid, {:query, text})
  end

  def add_file(pid, file) do
    GenServer.cast(pid, {:add_file, file})
  end

  # Server

  @impl true
  def init(
        [
          name: name,
          block_name: block_name,
          context_id: context_id,
          type: __MODULE__,
          opts: opts
        ] = state
      ) do
    subscribe_to_inputs(context_id, opts.inputs ++ ["#{block_name}:files"])

    %{global: global, parent: parent, local: local} =
      Buildel.Pipelines.Worker.context_from_context_id(context_id)

    collection_name =
      case opts.persist_in do
        "run" -> "#{global}_#{parent}_#{local}"
        "workflow" -> "#{global}_#{parent}"
      end

    with {:ok, collection} <- Buildel.VectorDB.init(collection_name) do
      {:ok,
       state
       |> assign_stream_state
       |> Keyword.put(:collection, collection.name)
       |> Keyword.put(:api_key, opts |> Map.get(:api_key))}
    else
      {:error, error} ->
        {:stop, "Failed to create collection #{inspect(name)} Error: #{inspect(error)}"}
    end
  end

  @impl true
  def handle_cast({:query, {:text, query}}, state) do
    state = send_stream_start(state)
    results = Buildel.VectorDB.query(state[:collection], query, api_key: state[:api_key])
    result = results |> Enum.at(0)

    Buildel.BlockPubSub.broadcast_to_io(
      state[:context_id],
      state[:block_name],
      "output",
      {:text, result}
    )

    state = send_stream_stop(state)

    {:noreply, state}
  end

  def handle_cast({:add_file, {:binary, file}}, state) do
    state = send_stream_start(state)
    Buildel.VectorDB.add(state[:collection], file, metadata: %{}, api_key: state[:api_key])
    state = send_stream_stop(state)
    {:noreply, state}
  end

  @impl true
  def handle_info({_name, :binary, binary}, state) do
    add_file(self(), {:binary, binary})
    {:noreply, state}
  end

  @impl true
  def handle_info({_name, :text, text}, state) do
    input(self(), {:text, text})

    {:noreply, state}
  end
end
