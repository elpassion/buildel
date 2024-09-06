defmodule Buildel.Blocks.DocumentTool do
  alias Buildel.Blocks.Fields.EditorField
  alias Buildel.Blocks.DocumentTool.DocumentToolJSON
  use Buildel.Blocks.Block
  use Buildel.Blocks.Tool

  # Config

  @impl true
  defdelegate cast(pid, chunk), to: __MODULE__, as: :query

  @impl true
  def options() do
    %{
      type: "document_tool",
      description:
        "It's a powerful tool for applications requiring quick and precise access to specific documents stored in Buildel's knowledge bases.",
      groups: ["tools", "file", "text"],
      inputs: [
        Block.file_input("input", false),
        Block.file_input("files", true)
      ],
      outputs: [
        Block.text_output("output", false)
      ],
      ios: [Block.io("tool", "worker")],
      dynamic_ios: nil,
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
                    "readonly" => true,
                    "title" => "Knowledge",
                    "description" => "The knowledge to use for retrieval.",
                    "default" => ""
                  }),
                call_formatter:
                  EditorField.call_formatter(%{
                    description: "The formatter to use when retrieving data from DB.",
                    default: "Database 📑: Document {{config.args}}\n",
                    display_when: %{
                      connections: %{
                        tool_worker: %{
                          min: 1
                        }
                      }
                    }
                  })
              )
          })
      }
    }
  end

  @impl true
  def tools(state) do
    [
      %{
        function: %{
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
          }
        },
        call_formatter: fn args ->
          args = %{"config.args" => args, "config.block_name" => state.block.name}
          build_call_formatter(state.block.opts.call_formatter, args)
        end,
        response_formatter: fn _response ->
          ""
        end
      }
    ]
  end

  # Client

  def query(pid, {:text, _text} = text) do
    GenServer.cast(pid, {:query, text})
  end

  def add_file(pid, file) do
    GenServer.cast(pid, {:add_file, file})
  end

  def delete_file(pid, file_id) do
    GenServer.cast(pid, {:delete_file, file_id})
  end

  # Server

  @impl true
  def setup(%{type: __MODULE__, opts: opts} = state) do
    {:ok,
     state
     |> Map.put(:collection, opts.knowledge)}
  end

  @impl true
  def handle_cast({:add_file, {:binary, file_path, metadata}}, state) do
    state = send_stream_start(state)

    %{global: organization_id} = block_context().context_from_context_id(state[:context_id])
    collection_id = state[:collection]

    organization = Buildel.Organizations.get_organization!(organization_id)

    try do
      with {:ok, collection} <-
             Buildel.Memories.get_organization_collection(organization, collection_id),
           {:ok, memory} <-
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
             ) do
        BlockPubSub.broadcast_to_io(
          state[:context_id],
          state[:block_name],
          "output",
          {:text, memory.content}
        )

        state = send_stream_stop(state)
        {:noreply, state}
      else
        {:error, _, message} ->
          send_error(state, message)

          state = state |> send_stream_stop()

          {:noreply, state}

        _ ->
          send_error(state, "Failed to add the file")

          state = state |> send_stream_stop()

          {:noreply, state}
      end
    rescue
      _ ->
        send_error(state, "Failed to add the file")

        state = state |> send_stream_stop()

        {:noreply, state}
    end
  end

  def handle_cast({:delete_file, file_id}, state) do
    state = send_stream_start(state)

    %{global: organization_id} = block_context().context_from_context_id(state[:context_id])
    collection_id = state[:collection]

    try do
      organization = Buildel.Organizations.get_organization!(organization_id)

      memory =
        Buildel.Memories.get_collection_memory_by_file_uuid!(organization, collection_id, file_id)

      {:ok, _} =
        Buildel.Memories.delete_organization_memory(organization, collection_id, memory.id)

      BlockPubSub.broadcast_to_io(
        state[:context_id],
        state[:block_name],
        "output",
        {:text, ""}
      )

      state = send_stream_stop(state)
      {:noreply, state}
    rescue
      _ ->
        send_error(state, "Failed to delete the file")

        state = state |> send_stream_stop()

        {:noreply, state}
    end
  end

  @impl true
  def handle_tool("tool", "documents", {_topic, :text, args, _}, state) do
    state = state |> send_stream_start()

    %{global: global} =
      block_context().context_from_context_id(state[:context_id])

    organization = global |> Buildel.Organizations.get_organization!()

    try do
      memory =
        Buildel.Memories.get_collection_memory_by_file_uuid!(
          organization,
          state[:collection],
          args["document_id"]
        )

      {DocumentToolJSON.show(%{memory: memory}) |> Jason.encode!(), state}
    rescue
      _ ->
        send_error(state, "Failed to retrieve the document")
        {"Failed to retrieve document", state}
    end
  end

  @impl true
  def handle_input("input", {_name, :text, file_id, %{method: :delete}}, state) do
    delete_file(self(), file_id)
    state
  end

  @impl true
  def handle_input("input", {_name, :binary, binary, metadata}, state) do
    add_file(self(), {:binary, binary, metadata})
    state
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

defmodule Buildel.Blocks.DocumentTool.DocumentToolJSON do
  def show(%{
        memory: memory
      }) do
    {:ok, memory_temporary_uuid} =
      Buildel.MemoriesAccess.add_chunk(%{
        memory_id: memory.id
      })

    %{
      content: "Document name: #{memory.file_name}\n\n#{memory.content |> String.trim()}",
      url:
        Application.get_env(:buildel, :page_url) <>
          "/knowledge-base/memories/#{memory_temporary_uuid}"
    }
  end
end
