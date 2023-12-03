defmodule Buildel.Blocks.DocumentTool do
  use Buildel.Blocks.Block
  alias LangChain.Function

  # Config

  @impl true
  defdelegate cast(pid, chunk), to: __MODULE__, as: :query

  @impl true
  def options() do
    %{
      type: "document_tool",
      groups: ["text", "tools"],
      inputs: [],
      outputs: [],
      ios: [Block.io("tool", "worker")],
      schema: schema()
    }
  end

  @impl true
  def schema() do
    %{
      "type" => "object",
      "required" => ["name", "inputs", "opts"],
      "properties" => %{
        "name" => name_schema(),
        "inputs" => inputs_schema(),
        "opts" =>
          options_schema(%{
            "required" => ["knowledge"],
            "properties" =>
              Jason.OrderedObject.new(
                knowledge:
                  memory_schema(%{
                    "title" => "Knowledge",
                    "description" => "The knowledge to use for retrieval.",
                    "default" => ""
                  })
              )
          })
      }
    }
  end

  def function(context_id, block_name) do
    Function.new!(%{
      name: "documents",
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
      function: fn %{"document_id" => document_id} = _args, _context ->
        pid = block_context().block_pid(context_id, block_name)

        query_sync(pid, {:text, document_id})
      end
    })
  end

  # Client

  def query(pid, {:text, _text} = text) do
    GenServer.cast(pid, {:query, text})
  end

  def query_sync(pid, {:text, _text} = text) do
    GenServer.call(pid, {:query, text})
  end

  # Server

  @impl true
  def init(
        [
          name: _name,
          block_name: _block_name,
          context_id: context_id,
          type: __MODULE__,
          opts: opts
        ] = state
      ) do
    subscribe_to_inputs(context_id, opts.inputs)

    %{global: global} =
      block_context().context_from_context_id(context_id)

    {:ok,
     state
     |> Keyword.put(:collection, opts[:knowledge])
     |> assign_stream_state(opts)}
  end

  @impl true
  def handle_cast({:query, {:text, query}}, state) do
    state = state |> send_stream_start()

    # TODO: Add support for async calling

    state = state |> schedule_stream_stop()

    {:noreply, state}
  end

  @impl true
  def handle_call({:query, {:text, document_id}}, _caller, state) do
    state = state |> send_stream_start()

    %{global: global} =
      block_context().context_from_context_id(state[:context_id])

    organization = global |> Buildel.Organizations.get_organization!()

    memory =
      Buildel.Memories.get_collection_memory!(organization, state[:collection], document_id)

    state = state |> schedule_stream_stop()

    {:reply, "Document name: #{memory.file_name}\n\n#{memory.content |> String.trim()}", state}
  end

  @impl true
  def handle_info({_name, :text, text}, state) do
    cast(self(), {:text, text})
    {:noreply, state}
  end

  defp block_context() do
    Application.fetch_env!(:buildel, :block_context_resolver)
  end
end
