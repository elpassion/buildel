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
        Block.file_input("files", true),
        Block.text_input("raw_file", false),
        Block.text_input("raw_chunk", false)
      ],
      outputs: [
        Block.text_output("output", false),
        Block.text_output("memory", false)
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
      },
      %{
        function: %{
          name: "list",
          description: "Retrieve documents list from knowledge base.",
          parameters_schema: %{
            type: "object",
            properties: %{},
            required: []
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

  def add_chunk(pid, chunk) do
    GenServer.cast(pid, {:add_chunk, chunk})
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

  @impl true
  def handle_cast({:add_file, {:text, content, metadata}}, state) do
    state = send_stream_start(state)

    %{global: organization_id} = block_context().context_from_context_id(state[:context_id])
    collection_id = state[:collection]

    organization = Buildel.Organizations.get_organization!(organization_id)

    with {:ok, collection} <-
           Buildel.Memories.get_organization_collection(organization, collection_id),
         {:ok, memory} <-
           %Buildel.Memories.Memory{}
           |> Buildel.Memories.Memory.changeset(%{
             file_uuid: metadata.file_id,
             file_name: metadata.file_name,
             file_size: 0,
             file_type: metadata.file_type,
             content: content,
             organization_id: organization.id,
             collection_name: collection.collection_name,
             memory_collection_id: collection.id
           })
           |> Buildel.Repo.insert() do
      {:noreply,
       output(state, "output", {:text, memory.content}, %{
         metadata: metadata |> Map.put(:memory_id, memory.id)
       })
       |> output(
         "memory",
         {:text,
          Jason.encode!(%{
            id: memory.id,
            collection_name: memory.collection_name,
            memory_collection_id: memory.memory_collection_id,
            file_name: memory.file_name
          })}
       )}
    end
  end

  @impl true
  def handle_cast({:add_chunk, {:text, chunks, metadata}}, state) do
    state = send_stream_start(state)

    %{global: organization_id} = block_context().context_from_context_id(state[:context_id])

    organization = Buildel.Organizations.get_organization!(organization_id)

    {:ok, collection, collection_name} =
      block_context().get_global_collection(state.context_id, state.collection)

    api_key =
      block_context().get_secret_from_context(state.context_id, collection.embeddings_secret_name)

    workflow =
      Buildel.DocumentWorkflow.new(%{
        embeddings:
          Buildel.Clients.Embeddings.new(%{
            api_type: collection.embeddings_api_type,
            model: collection.embeddings_model,
            api_key: api_key,
            endpoint: collection.embeddings_endpoint
          }),
        collection_name: collection_name,
        db_adapter: Buildel.VectorDB.EctoAdapter,
        workflow_config: %{
          chunk_size: collection.chunk_size,
          chunk_overlap: collection.chunk_overlap
        }
      })

    Enum.chunk_every(chunks, 20)
    |> Task.async_stream(
      fn chunks ->
        with %{chunks: chunks, embeddings_tokens: embeddings_tokens} when is_list(chunks) <-
               Buildel.DocumentWorkflow.generate_embeddings_for_chunks(workflow, chunks),
             %{memory: %{id: memory_id, file_name: file_name}} <- List.first(chunks),
             cost_amount <-
               Buildel.Costs.CostCalculator.calculate_embeddings_cost(
                 %Buildel.Langchain.EmbeddingsTokenSummary{
                   tokens: embeddings_tokens,
                   model: collection.embeddings_model,
                   endpoint: collection.embeddings_endpoint
                 }
               ),
             {:ok, cost} <-
               Buildel.Organizations.create_organization_cost(
                 organization,
                 %{
                   amount: cost_amount,
                   input_tokens: embeddings_tokens,
                   output_tokens: 0
                 }
               ),
             {:ok, _} <-
               Buildel.Memories.create_memory_collection_cost(collection, cost, %{
                 cost_type: :file_upload,
                 description: file_name
               }) do
          chunks =
            chunks
            |> put_in(
              [Access.all(), Access.key!(:metadata), :memory_id],
              memory_id
            )
            |> put_in([Access.all(), Access.key!(:metadata), :file_name], file_name)

          Buildel.DocumentWorkflow.put_in_database(workflow, chunks)
        end
      end,
      max_concurrency: 4,
      timeout: 5 * 60_000
    )
    |> Stream.run()

    state = output(state, "chunk", {:text, "ok"}, %{metadata: metadata})

    state = send_stream_stop(state)

    {:noreply, state}
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
  def handle_tool("tool", "list", {_topic, :text, _args, _}, state) do
    state = state |> send_stream_start()

    %{global: organization_id} = block_context().context_from_context_id(state.context_id)
    organization = Buildel.Organizations.get_organization!(organization_id)

    {:ok, collection, _collection_name} =
      block_context().get_global_collection(state.context_id, state.opts.knowledge)

    collection_files =
      Buildel.Memories.list_organization_collection_memories(organization, collection)
      |> Enum.map(fn memory ->
        %{
          document_name: memory.file_name,
          id: memory.file_uuid
        }
      end)

    {collection_files |> Jason.encode!(), state}
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

  @impl true
  def handle_input("raw_file", {_name, :text, text, metadata}, state) do
    add_file(self(), {:text, text, metadata})
    state
  end

  @impl true
  def handle_input("raw_chunk", {_name, :text, text, metadata}, state) do
    add_chunk(
      self(),
      {:text,
       text
       |> Jason.decode!(keys: :atoms)
       |> Enum.map(fn chunk ->
         metadata =
           Map.merge(
             %{
               building_block_ids: [],
               index: 0,
               keywords: [],
               next: nil,
               prev: nil,
               parent: nil,
               pages: []
             },
             chunk |> Map.get(:metadata, %{})
           )

         Map.merge(
           %{metadata: metadata, chunk_type: "chunk"},
           chunk |> Map.drop([:metadata])
         )
         |> Map.put_new_lazy(:id, &UUID.uuid4/0)
       end), metadata}
    )

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
