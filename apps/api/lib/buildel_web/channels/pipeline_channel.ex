defmodule BuildelWeb.PipelineChannel do
  use Phoenix.Channel, log_handle_in: false
  use BuildelWeb.Validator

  require Logger
  alias BuildelWeb.PipelineChannel.Message.Text
  alias EarmarkParser.Message
  alias Buildel.Pipelines
  alias Buildel.Pipelines.Pipeline

  defmodule Message do
    alias Buildel.Encrypted.Binary

    defmodule Binary do
      def new(chunk, metadata) do
        {:binary, combine_binary_metadata(chunk, metadata)}
      end

      defp combine_binary_metadata(chunk, metadata) do
        metadata_json =
          Jason.encode!(%{
            metadata: metadata,
            created_at: Map.get(metadata, "_broadcast_date")
          })

        metadata_size = byte_size(metadata_json)
        size_bin = <<metadata_size::32>>
        size_bin <> metadata_json <> chunk
      end
    end

    defmodule Text do
      def new(message, metadata) do
        %{
          message: message,
          metadata: metadata,
          created_at: Map.get(metadata, "_broadcast_date")
        }
      end

      def from_binary(
            <<metadata_size::32, metadata_json::bytes-size(metadata_size), content::binary>>
          ) do
        metadata = Jason.decode!(metadata_json)

        %{
          metadata: metadata,
          message: content,
          created_at: nil
        }
      end
    end
  end

  defparams :join do
    required(:auth, :string)
    required(:user_data, :string)

    required(:initial_inputs, {:array, :map}) do
      required(:name, :string)
      required(:value, :string)
    end

    required(:alias, :string)
    required(:metadata, :map)
  end

  @default_params %{
    "auth" => "default",
    "user_data" => "{}",
    "initial_inputs" => [],
    "alias" => "latest",
    "metadata" => %{}
  }

  def join(channel_name, params, socket) do
    params = Map.merge(@default_params, params)

    with {:ok, %{organization_id: organization_id, pipeline_id: pipeline_id, run_id: run_id}} <-
           parse_channel_name(channel_name),
         {:ok,
          %{
            auth: auth,
            user_data: user_data,
            initial_inputs: initial_inputs,
            alias: alias,
            metadata: metadata
          }} <-
           validate(:join, params),
         {:ok, pipeline_id} <- Buildel.Utils.parse_id(pipeline_id),
         {:ok, organization_id} <- Buildel.Utils.parse_id(organization_id),
         {:ok, run_id} <- Buildel.Utils.parse_id(run_id),
         organization <- Buildel.Organizations.get_organization!(organization_id),
         {:ok, %Pipelines.Pipeline{id: pipeline_id} = pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, _} <- Pipelines.verify_pipeline_budget_limit(pipeline),
         {:ok, config} <- Pipelines.get_pipeline_config(pipeline, alias),
         :ok <-
           verify_auth_token(
             is_public_interface?(pipeline.interface_config, metadata),
             socket.id,
             channel_name,
             user_data,
             auth,
             organization.api_key
           ),
         {:ok, run} <-
           Pipelines.upsert_run(%{
             id: run_id,
             pipeline_id: pipeline_id,
             config: config |> Map.put("metadata", metadata)
           }),
         run_interface <- get_interface_config(pipeline, metadata),
         {:ok, run} <- Pipelines.Runner.start_run(run, run_interface) do
      initial_inputs |> Enum.each(&process_input(&1.name, &1.value, run))

      listen_to_outputs(run)

      {:ok,
       %{
         run: %{
           id: run.id,
           interface_config: run_interface
         },
         pipeline: %{
           id: pipeline.id,
           organization_id: pipeline.organization_id,
           name: pipeline.name
         }
       }, socket |> assign(:run, run) |> assign(:joined_existing, run_id != nil)}
    else
      {:error, :invalid_id} ->
        {:error, %{reason: "not_found"}}

      {:error, :not_found} ->
        {:error, %{reason: "not_found"}}

      {:error, :failed_to_verify_token} ->
        {:error, %{reason: "unauthorized"}}

      {:error, :budget_limit_exceeded} ->
        {:error, %{reason: "Budget limit exceeded"}}

      {:error, %Ecto.Changeset{} = changeset} ->
        {:error,
         %{
           reason: "invalid",
           errors: BuildelWeb.ChangesetJSON.error(%{changeset: changeset}).errors
         }}

      {:error, {:shutdown, {:failed_to_start_child, _, {:error, block_name, reason}}}} ->
        {:error, %{errors: %{[block_name] => [reason]}}}

      err ->
        Logger.error("Unhandled error: #{inspect(err)}")
        {:error, %{reason: "unknown"}}
    end
  end

  def get_interface_config(%Pipeline{} = pipeline, metadata) do
    case pipeline.interface_config do
      nil -> %{}
      interface_config -> Map.get(interface_config, Map.get(metadata, "interface"), %{})
    end
  end

  def terminate(_reason, socket) do
    if socket.assigns |> Map.has_key?(:run) && !socket.assigns.joined_existing do
      Pipelines.Runner.stop_run(socket.assigns.run)
    end

    :ok
  end

  def handle_in("history", _data, socket) do
    send_previous_events(socket)
  end

  def handle_in("input:" <> input, data, socket) do
    process_input(input, data, socket.assigns.run)

    {:noreply, socket}
  end

  def handle_in(event, data, socket) do
    Logger.warning("Unhandled message #{inspect(event)}: #{inspect(data)}")
    {:noreply, socket}
  end

  defp send_previous_events(socket) do
    public_outputs =
      socket.assigns.run
      |> Pipelines.blocks_for_run()
      |> Enum.map(fn block ->
        public_outputs =
          block.type.options().outputs |> Enum.filter(fn output -> output.public end)

        Enum.map(public_outputs, fn output -> {block.name, output.name} end)
      end)
      |> List.flatten()

    events =
      socket.assigns.run
      |> Pipelines.get_pipeline_run_logs()
      |> Enum.map(&log_to_history_event/1)
      |> Enum.filter(fn event -> {event.block, event.io} in public_outputs end)

    socket |> Phoenix.Channel.push("history", %{events: events})

    {:noreply, socket}
  end

  defp log_to_history_event(%Pipelines.Log{} = log) do
    %{
      message: log.message,
      type: log.message_type,
      block: log.block_name,
      io: log.output_name,
      created_at: log.inserted_at
    }
  end

  defp process_input(input, data, run) do
    [block_name, input_name] = input |> String.split(":")
    context_id = Pipelines.Worker.context_id(run)

    %{data: data, metadata: metadata} =
      case data do
        {:binary, content} ->
          block_type =
            run.interface_config
            |> Map.get("inputs", [])
            |> Enum.find(%{}, fn input -> Map.get(input, "name") == block_name end)
            |> Map.get("type")

          if block_type == "file_input" or block_type == "image_input" do
            %{metadata: metadata, message: file} = Text.from_binary(content)
            {:ok, path} = Temp.path(suffix: metadata |> Map.get("file_name"))
            File.write!(path, file)

            %{data: {:binary, path}, metadata: metadata}
          else
            %{data: data, metadata: %{}}
          end

        _ ->
          %{data: {:text, data}, metadata: %{}}
      end

    Buildel.BlockPubSub.broadcast_to_io(context_id, block_name, input_name, data, metadata)
  end

  def handle_info({output_name, :binary, chunk, metadata}, socket) do
    Logger.debug("Channel Sending binary chunk to #{output_name}")

    %{block: block_name, io: output_name} = parse_topic(output_name)

    run = socket.assigns.run

    interface_output_block_names =
      (Map.get(run.interface_config, "outputs", []) ++
         Map.get(run.interface_config, "inputs", []) ++
         Map.get(run.interface_config, "audio_outputs", []) ++
         Map.get(run.interface_config, "audio_inputs", []))
      |> Enum.map(&Map.get(&1, "name"))

    message = Message.Binary.new(chunk, metadata)

    case interface_output_block_names do
      [] ->
        socket
        |> Phoenix.Channel.push("output:#{block_name}:#{output_name}", message)

        {:noreply, socket}

      block_names ->
        if Enum.member?(block_names, block_name) do
          socket
          |> Phoenix.Channel.push("output:#{block_name}:#{output_name}", message)

          {:noreply, socket}
        else
          {:noreply, socket}
        end
    end
  end

  def handle_info({output_name, :text, message, metadata}, socket) do
    Logger.debug("Channel Sending text chunk to #{output_name}")

    %{block: block_name, io: output_name} = parse_topic(output_name)

    message = Message.Text.new(message, metadata)

    run = socket.assigns.run

    interface_output_block_names =
      (Map.get(run.interface_config, "outputs", []) ++
         Map.get(run.interface_config, "inputs", []) ++
         Map.get(run.interface_config, "audio_outputs", []) ++
         Map.get(run.interface_config, "audio_inputs", []))
      |> Enum.map(&Map.get(&1, "name"))

    case interface_output_block_names do
      [] ->
        socket |> Phoenix.Channel.push("output:#{block_name}:#{output_name}", message)
        {:noreply, socket}

      block_names ->
        if Enum.member?(block_names, block_name) do
          socket
          |> Phoenix.Channel.push("output:#{block_name}:#{output_name}", message)

          {:noreply, socket}
        else
          {:noreply, socket}
        end
    end
  end

  def handle_info({output_name, :start_stream, _, _metadata}, socket) do
    case parse_topic(output_name) do
      %{io: nil, block: block_name} ->
        socket |> Phoenix.Channel.push("start:#{block_name}", %{})

      _ ->
        "skip"
    end

    {:noreply, socket}
  end

  def handle_info({output_name, :stop_stream, _, _metadata}, socket) do
    case parse_topic(output_name) do
      %{io: nil, block: block_name} ->
        socket |> Phoenix.Channel.push("stop:#{block_name}", %{})

      _ ->
        "skip"
    end

    {:noreply, socket}
  end

  def handle_info({output_name, :error, errors, _metadata}, socket) do
    case parse_topic(output_name) do
      %{io: nil, block: block_name} ->
        socket |> Phoenix.Channel.push("error:#{block_name}", %{errors: errors})

      _ ->
        "skip"
    end

    {:noreply, socket}
  end

  defp parse_topic(topic) do
    Buildel.BlockPubSub.io_from_topic(topic)
  end

  defp parse_channel_name(channel_name) do
    case channel_name |> String.split(":") do
      ["pipelines", organization_id, pipeline_id, run_id] ->
        {:ok, %{organization_id: organization_id, pipeline_id: pipeline_id, run_id: run_id}}

      ["pipelines", organization_id, pipeline_id] ->
        {:ok, %{organization_id: organization_id, pipeline_id: pipeline_id, run_id: nil}}

      _ ->
        {:error, :not_found}
    end
  end

  defp listen_to_outputs(run) do
    context_id = Pipelines.Worker.context_id(run)

    run
    |> Pipelines.blocks_for_run()
    |> Enum.map(fn block ->
      public_outputs = block.type.options().outputs |> Enum.filter(fn output -> output.public end)
      Buildel.BlockPubSub.subscribe_to_block(context_id, block.name)

      for output <- public_outputs do
        Buildel.BlockPubSub.subscribe_to_io(context_id, block.name, output.name)
      end
    end)
  end

  defp is_public_interface?(interface_config, metadata) do
    case Map.get(metadata, "interface") do
      nil ->
        false

      interface ->
        case Map.get(interface_config, interface, %{}) do
          %{"public" => public} -> public
          _ -> false
        end
    end
  end

  defp verify_auth_token(
         true,
         _,
         _,
         _,
         _,
         _
       ) do
    :ok
  end

  defp verify_auth_token(
         _config,
         socket_id,
         channel_name,
         user_json,
         auth_token,
         secret
       ) do
    BuildelWeb.ChannelAuth.verify_auth_token(
      socket_id,
      channel_name,
      user_json,
      auth_token,
      secret
    )
  end
end
