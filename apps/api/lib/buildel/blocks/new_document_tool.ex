defmodule Buildel.Blocks.NewDocumentTool do
  alias Buildel.Blocks.NewDocumentTool.DocumentToolJSON
  alias Buildel.Clients.Utils.Context

  use Buildel.Blocks.NewBlock
  use Buildel.Blocks.NewBlock.Memory

  import Buildel.Blocks.Utils.Schemas

  defblock(:document_tool,
    description:
      "It's a powerful tool for applications requiring quick and precise access to specific documents stored in Buildel's knowledge bases.",
    groups: ["tools", "file", "text"]
  )

  definput(:input, schema: %{"type" => "object"}, type: :file)
  definput(:files, schema: %{"type" => "object"}, type: :file, public: true)

  defoutput(:output, schema: %{})

  deftool(:document,
    description: "Retrieve full document by id.",
    schema: %{
      type: "object",
      properties: %{
        document_id: %{
          type: "string",
          description: "Document id (uuid)"
        }
      },
      required: ["document_id"]
    }
  )

  deftool(:list,
    description: "Retrieve documents list from knowledge base.",
    schema: %{
      type: "object",
      properties: %{},
      required: []
    }
  )

  defoption(
    :knowledge,
    memory_schema(%{
      "readonly" => true,
      "title" => "Knowledge",
      "description" => "The knowledge to use for retrieval.",
      "default" => ""
    })
  )

  def handle_input(:input, %Message{metadata: %{method: :delete}, message: file} = message, state) do
    send_stream_start(state, :output, message)

    %{global: organization_id} = Context.context_from_context_id(state.context.context_id)
    collection_id = option(state, :knowledge)

    try do
      organization = Buildel.Organizations.get_organization!(organization_id)

      memory =
        Buildel.Memories.get_collection_memory_by_file_uuid!(
          organization,
          collection_id,
          file.file_id
        )

      {:ok, _} =
        Buildel.Memories.delete_organization_memory(organization, collection_id, memory.id)

      output(
        state,
        :output,
        Message.from_message(message)
        |> Message.set_message("")
        |> Message.set_type(:text)
      )

      {:ok, state}
    rescue
      _ ->
        message =
          Message.from_message(message)
          |> Message.set_type(:text)
          |> Message.set_message("Failed to remove the file")

        send_error(state, message)

        send_stream_stop(state, :output, message)

        {:error, "Failed to remove the file", state}
    end
  end

  def handle_input(:input, %Message{type: :file, message: file} = message, state) do
    send_stream_start(state, :output, message)

    %{global: organization_id} = Context.context_from_context_id(state.context.context_id)
    collection_id = option(state, :knowledge)

    organization = Buildel.Organizations.get_organization!(organization_id)

    try do
      with {:ok, collection} <-
             Buildel.Memories.get_organization_collection(organization, collection_id),
           {:ok, memory} <-
             Buildel.Memories.create_organization_memory(
               organization,
               collection,
               %{
                 path: file |> Map.get(:path),
                 type: file |> Map.get(:file_type),
                 name: file |> Map.get(:file_name)
               },
               %{
                 file_uuid: file |> Map.get(:file_id)
               }
             ) do
        output(
          state,
          :output,
          Message.from_message(message)
          |> Message.set_message(memory.content)
          |> Message.set_type(:text)
        )

        {:ok, state}
      else
        {:error, reason, message} ->
          message =
            Message.from_message(message)
            |> Message.set_type(:text)
            |> Message.set_message(reason)

          send_error(state, message)

          send_stream_stop(state, :output, message)

          {:error, reason, state}

        _ ->
          message =
            Message.from_message(message)
            |> Message.set_type(:text)
            |> Message.set_message("Failed to add the file")

          send_error(state, message)

          send_stream_stop(state, :output, message)

          {:error, "Failed to add the file", state}
      end
    rescue
      _ ->
        message =
          Message.from_message(message)
          |> Message.set_type(:text)
          |> Message.set_message("Failed to add the file")

        send_error(state, message)

        send_stream_stop(state, :output, message)

        {:error, "Failed to add the file", state}
    end
  end

  def handle_tool_call(:document, %Message{message: %{args: args}} = message, state) do
    send_stream_start(state, :output, message)

    %{global: organization_id} = Context.context_from_context_id(state.context.context_id)

    organization = organization_id |> Buildel.Organizations.get_organization!()

    try do
      memory =
        Buildel.Memories.get_collection_memory_by_file_uuid!(
          organization,
          option(state, :knowledge),
          args["document_id"]
        )

      response =
        message
        |> Message.from_message()
        |> Message.set_message(DocumentToolJSON.show(%{memory: memory}) |> Jason.encode!())

      output(state, :output, response |> Message.set_type(:text))

      {:ok, response, state}
    rescue
      _ ->
        send_error(
          state,
          Message.from_message(message)
          |> Message.set_type(:text)
          |> Message.set_message("Failed to retrieve the document")
        )

        send_stream_stop(state, :output, message)

        {:error, "Failed to retrieve document", state}
    end
  end

  def handle_tool_call(:list, %Message{} = message, state) do
    send_stream_start(state, :output, message)

    %{global: organization_id} = Context.context_from_context_id(state.context.context_id)

    organization = Buildel.Organizations.get_organization!(organization_id)

    {:ok, collection, _collection_name} =
      memory().get_global_collection(state.context.context_id, option(state, :knowledge))

    collection_files =
      Buildel.Memories.list_organization_collection_memories(organization, collection)
      |> Enum.map(fn memory ->
        %{
          document_name: memory.file_name,
          id: memory.file_uuid
        }
      end)

    response =
      message
      |> Message.from_message()
      |> Message.set_message(collection_files |> Jason.encode!())

    output(state, :output, response |> Message.set_type(:text))

    {:ok, response, state}
  end
end

defmodule Buildel.Blocks.NewDocumentTool.DocumentToolJSON do
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
