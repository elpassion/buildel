defmodule Buildel.Blocks.DocumentTool do
  alias Buildel.Blocks.Fields.EditorField
  use Buildel.Blocks.Block
  alias LangChain.Function

  # Config

  @impl true
  defdelegate cast(pid, chunk), to: __MODULE__, as: :query

  @impl true
  def options() do
    %{
      type: "document_tool",
      description:
        "It's a powerful tool for applications requiring quick and precise access to specific documents stored in Buildel's knowledge bases.",
      groups: ["text", "tools"],
      inputs: [
        Block.file_input("input", false)
      ],
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
                  }),
                call_formatter:
                  EditorField.call_formatter(%{
                    description: "The formatter to use when retrieving data from DB.",
                    default: "Database 📑: Document {{config.args}}\n"
                  })
              )
          })
      }
    }
  end

  # Client

  def query(pid, {:text, _text} = text) do
    GenServer.cast(pid, {:query, text})
  end

  def query_sync(pid, {:text, _text} = text) do
    GenServer.call(pid, {:query, text})
  end

  def add_file(pid, file) do
    GenServer.cast(pid, {:add_file, file})
  end

  # Server

  @impl true
  def init(%{context_id: context_id, type: __MODULE__, opts: opts} = state) do
    subscribe_to_connections(context_id, state.connections)

    {:ok,
     state
     |> Map.put(:collection, opts.knowledge)
     |> assign_stream_state(opts)}
  end

  @impl true
  def handle_cast({:query, {:text, _query}}, state) do
    state = state |> send_stream_start()

    # TODO: Add support for async calling

    state = state |> schedule_stream_stop()

    {:noreply, state}
  end

  def handle_cast({:add_file, {:binary, file_path, metadata}}, state) do
    state = send_stream_start(state)

    %{global: organization_id} = block_context().context_from_context_id(state[:context_id])
    collection_id = state[:collection]

    organization = Buildel.Organizations.get_organization!(organization_id)
    {:ok, collection} = Buildel.Memories.get_organization_collection(organization, collection_id)

    Buildel.Memories.create_organization_memory(
      organization,
      collection,
      %{
        path: file_path,
        type: metadata |> Map.get(:file_type),
        name: metadata |> Map.get(:file_name)
      },
      %{
        file_uuid: metadata |> Map.get(:file_id)
      }
    )

    state = send_stream_stop(state)
    {:noreply, state}
  end

  @impl true
  def handle_call({:query, {:text, file_uuid}}, _caller, state) do
    state = state |> send_stream_start()

    %{global: global} =
      block_context().context_from_context_id(state[:context_id])

    organization = global |> Buildel.Organizations.get_organization!()

    memory =
      Buildel.Memories.get_collection_memory_by_file_uuid!(
        organization,
        state[:collection],
        file_uuid
      )

    state = state |> schedule_stream_stop()

    {:reply, "Document name: #{memory.file_name}\n\n#{memory.content |> String.trim()}", state}
  end

  @impl true
  def handle_call({:function, _}, _from, state) do
    pid = self()

    function =
      Function.new!(%{
        name: "documents",
        description: "Retrieve full document by id.",
        parameters_schema: %{
          type: "object",
          properties: %{
            document_id: %{
              type: "string",
              description: "Document id (uuid)"
            }
          },
          required: ["document_id"]
        },
        function: fn %{"document_id" => document_id} = _args, _context ->
          query_sync(pid, {:text, document_id})
        end
      })

    {:reply,
     %{
       function: function,
       call_formatter: fn args ->
         args = %{"config.args" => args, "config.block_name" => state.block.name}
         build_call_formatter(state.block.opts.call_formatter, args)
       end,
       response_formatter: fn _response ->
         ""
       end
     }, state}
  end

  @impl true
  def handle_info({_name, :text, text, _metadata}, state) do
    cast(self(), {:text, text})
    {:noreply, state}
  end

  @impl true
  def handle_info({_name, :binary, binary, metadata}, state) do
    add_file(self(), {:binary, binary, metadata})
    {:noreply, state}
  end

  defp build_call_formatter(value, args) do
    args
    |> Enum.reduce(value, fn
      {key, value}, acc when is_number(value) ->
        String.replace(acc, "{{#{key}}}", value |> to_string() |> URI.encode())

      {key, value}, acc when is_binary(value) ->
        String.replace(acc, "{{#{key}}}", value |> to_string() |> URI.encode())

      {key, value}, acc when is_map(value) ->
        String.replace(acc, "{{#{key}}}", Jason.encode!(value))

      _, acc ->
        acc
    end)
  end
end
