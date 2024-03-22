defmodule BuildelWeb.PipelineChannel do
  use Phoenix.Channel, log_handle_in: false
  use BuildelWeb.Validator

  require Logger
  alias Buildel.Pipelines

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
         {:ok, config} <- Pipelines.get_pipeline_config(pipeline, alias),
         :ok <-
           verify_auth_token(
             pipeline.interface_config,
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
         {:ok, run} <- Pipelines.Runner.start_run(run) do
      initial_inputs |> Enum.each(&process_input(&1.name, &1.value, run))

      listen_to_outputs(run)

      {:ok, %{run: %{id: run.id}},
       socket |> assign(:run, run) |> assign(:joined_existing, run_id != nil)}
    else
      {:error, :invalid_id} ->
        {:error, %{reason: "not_found"}}

      {:error, :not_found} ->
        {:error, %{reason: "not_found"}}

      {:error, :failed_to_verify_token} ->
        {:error, %{reason: "unauthorized"}}

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

  def terminate(_reason, socket) do
    if socket.assigns |> Map.has_key?(:run) && !socket.assigns.joined_existing do
      Pipelines.Runner.stop_run(socket.assigns.run)
    end

    :ok
  end

  def handle_in("input:" <> input, data, socket) do
    process_input(input, data, socket.assigns.run)

    {:noreply, socket}
  end

  def handle_in(event, data, socket) do
    Logger.warning("Unhandled message #{inspect(event)}: #{inspect(data)}")
    {:noreply, socket}
  end

  defp process_input(input, data, run) do
    [block_name, input_name] = input |> String.split(":")
    context_id = Pipelines.Worker.context_id(run)

    data =
      case data do
        {:binary, _} -> data
        _ -> {:text, data}
      end

    Buildel.BlockPubSub.broadcast_to_io(context_id, block_name, input_name, data)
  end

  def handle_info({output_name, :binary, chunk}, socket) do
    Logger.debug("Channel Sending binary chunk to #{output_name}")

    %{block_name: block_name, output_name: output_name} = parse_topic(output_name)

    socket |> Phoenix.Channel.push("output:#{block_name}:#{output_name}", {:binary, chunk})
    {:noreply, socket}
  end

  def handle_info({output_name, :text, message}, socket) do
    Logger.debug("Channel Sending text chunk to #{output_name}")

    %{block_name: block_name, output_name: output_name} = parse_topic(output_name)

    socket |> Phoenix.Channel.push("output:#{block_name}:#{output_name}", %{message: message})
    {:noreply, socket}
  end

  def handle_info({output_name, :start_stream, _}, socket) do
    case parse_topic(output_name) do
      %{output_name: nil, block_name: block_name} ->
        socket |> Phoenix.Channel.push("start:#{block_name}", %{})

      _ ->
        "skip"
    end

    {:noreply, socket}
  end

  def handle_info({output_name, :stop_stream, _}, socket) do
    case parse_topic(output_name) do
      %{output_name: nil, block_name: block_name} ->
        socket |> Phoenix.Channel.push("stop:#{block_name}", %{})

      _ ->
        "skip"
    end

    {:noreply, socket}
  end

  def handle_info({output_name, :error, errors}, socket) do
    case parse_topic(output_name) do
      %{output_name: nil, block_name: block_name} ->
        socket |> Phoenix.Channel.push("error:#{block_name}", %{errors: errors})

      _ ->
        "skip"
    end

    {:noreply, socket}
  end

  defp parse_topic(topic) do
    case topic |> String.split("::") do
      ["context", context_id, "block", block_name, "io", output_name] ->
        %{
          context_id: context_id,
          block_name: block_name,
          output_name: output_name
        }

      ["context", context_id, "block", block_name] ->
        %{
          context_id: context_id,
          block_name: block_name,
          output_name: nil
        }
    end
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
      public_outputs = block.type.options.outputs |> Enum.filter(fn output -> output.public end)
      Buildel.BlockPubSub.subscribe_to_block(context_id, block.name)

      for output <- public_outputs do
        Buildel.BlockPubSub.subscribe_to_io(context_id, block.name, output.name)
      end
    end)
  end

  defp verify_auth_token(%{"public" => true}, _, _, _, _, _) do
    :ok
  end

  defp verify_auth_token(_config, socket_id, channel_name, user_json, auth_token, secret) do
    BuildelWeb.ChannelAuth.verify_auth_token(
      socket_id,
      channel_name,
      user_json,
      auth_token,
      secret
    )
  end
end
