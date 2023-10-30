defmodule BuildelWeb.PipelineChannel do
  use Phoenix.Channel, log_handle_in: false
  use BuildelWeb.Validator

  require Logger
  alias Buildel.Pipelines

  defparams :join do
    required(:auth, :string)
    required(:user_data, :string)
  end

  def join("pipelines:" <> organization_pipeline_id = channel_name, params, socket) do
    with {:ok, %{auth: auth, user_data: user_data}} <- validate(:join, params),
         [organization_id, pipeline_id] <- String.split(organization_pipeline_id, ":"),
         {:ok, pipeline_id} <- Buildel.Utils.parse_id(pipeline_id),
         {:ok, organization_id} <- Buildel.Utils.parse_id(organization_id),
         organization <- Buildel.Organizations.get_organization!(organization_id),
         :ok <-
           BuildelWeb.ChannelAuth.verify_auth_token(
             socket.id,
             channel_name,
             user_data,
             auth,
             organization.api_key
           ),
         {:ok, %Pipelines.Pipeline{id: pipeline_id, config: config}} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, run} <- Pipelines.create_run(%{pipeline_id: pipeline_id, config: config}),
         {:ok, run} <- Pipelines.Runner.start_run(run) do
      listen_to_outputs(run)
      {:ok, %{run: %{}}, socket |> assign(:run, run)}
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
        IO.inspect(err)
        {:error, %{reason: "unknown"}}
    end
  end

  def terminate(_reason, socket) do
    if socket.assigns |> Map.has_key?(:run) do
      Pipelines.Runner.stop_run(socket.assigns.run)
    end

    :ok
  end

  def handle_in("input:" <> input, data, socket) do
    [block_name, input_name] = input |> String.split(":")
    context_id = Pipelines.Worker.context_id(socket.assigns.run)

    data =
      case data do
        {:binary, _} -> data
        _ -> {:text, data}
      end

    Buildel.BlockPubSub.broadcast_to_io(context_id, block_name, input_name, data)
    {:noreply, socket}
  end

  def handle_in(event, data, socket) do
    Logger.warning("Unhandled message #{inspect(event)}: #{inspect(data)}")
    {:noreply, socket}
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

  defp listen_to_outputs(run) do
    context_id = Pipelines.Worker.context_id(run)

    run
    |> Pipelines.blocks_for_run()
    |> Enum.map(fn block ->
      block_type = block.type |> Buildel.Blocks.type()
      public_outputs = block_type.options.outputs |> Enum.filter(fn output -> output.public end)
      Buildel.BlockPubSub.subscribe_to_block(context_id, block.name)

      for output <- public_outputs do
        Buildel.BlockPubSub.subscribe_to_io(context_id, block.name, output.name)
      end
    end)
  end
end
