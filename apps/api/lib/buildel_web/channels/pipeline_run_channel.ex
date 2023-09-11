defmodule BuildelWeb.PipelineRunChannel do
  use Phoenix.Channel, log_handle_in: false

  require Logger
  alias Buildel.Pipelines
  alias Buildel.Blocks.Block

  def join("pipeline_runs:" <> run_id, _params, socket) do
    with {:ok, run_id} <- Buildel.Utils.parse_id(run_id),
         %Buildel.Pipelines.Run{} = run <- Buildel.Pipelines.get_run(run_id) do
      socket =
        socket
        |> assign(:run, run)

      run |> listen_to_outputs()

      {:ok, %{run: run}, socket}
    else
      _ -> {:error, %{reason: "not_found", run_id: run_id}}
    end
  end

  def handle_in("block_input_" <> block_id, data, socket) do
    Buildel.Pipelines.Runner.get_run_blocks(socket.assigns.run)
    |> Enum.each(fn %{pid: pid, type: block_type} ->
      case Block.name(pid) do
        ^block_id ->
          Logger.debug("Sending input to #{inspect(pid)}")
          block_type.input(pid, data)

        _ ->
          Logger.debug("Ignoring input for #{inspect(pid)}")
      end
    end)

    {:noreply, socket}
  end

  def handle_in("get_blocks", _payload, socket) do
    block_definitions = Buildel.Pipelines.blocks_for_run(socket.assigns.run)
    running_blocks = Buildel.Pipelines.Runner.get_run_blocks(socket.assigns.run)

    blocks =
      running_blocks
      |> Enum.map(fn %{
                       type: block_type,
                       name: name,
                       block_name: block_name,
                       context_id: context_id
                     } ->
        options = block_type.options()

        %{
          config: block_definitions |> Enum.find(fn def -> def.name == block_name end),
          block_type: options,
          context: %{
            context_id: context_id,
            block_id: name,
            inputs:
              options.inputs
              |> Enum.map(fn input ->
                input
                |> Map.put(:id, Buildel.BlockPubSub.io_topic(context_id, block_name, input.name))
              end),
            outputs:
              options.outputs
              |> Enum.map(fn output ->
                output
                |> Map.put(:id, Buildel.BlockPubSub.io_topic(context_id, block_name, output.name))
              end)
          }
        }
      end)

    {:reply, {:ok, %{blocks: blocks}}, socket}
  end

  def handle_in(event, data, socket) do
    Logger.warning("Unhandled message #{inspect(event)}: #{inspect(data)}")
    {:noreply, socket}
  end

  def handle_info({output_name, :binary, chunk}, socket) do
    Logger.debug("Channel Sending binary chunk to #{output_name}")
    socket |> Phoenix.Channel.broadcast!(output_name, {:binary, chunk})
    {:noreply, socket}
  end

  def handle_info({output_name, :text, message}, socket) do
    Logger.debug("Channel Sending text chunk to #{output_name}")
    socket |> Phoenix.Channel.broadcast!(output_name, %{message: message})
    {:noreply, socket}
  end

  def handle_info({_output_name, :start_stream, _}, socket) do
    {:noreply, socket}
  end

  def handle_info({_output_name, :stop_stream, _}, socket) do
    {:noreply, socket}
  end

  defp listen_to_outputs(run) do
    run
    |> Pipelines.blocks_for_run()
    |> Enum.map(fn block ->
      block_type = block.type |> Buildel.Blocks.type()
      public_outputs = block_type.options.outputs |> Enum.filter(fn output -> output.public end)

      for output <- public_outputs do
        context_id = Pipelines.Worker.context_id(run)
        Buildel.BlockPubSub.subscribe_to_io(context_id, block.name, output.name)
      end
    end)
  end
end
