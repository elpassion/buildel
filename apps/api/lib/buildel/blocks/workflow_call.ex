defmodule Buildel.Blocks.WorkflowCall do
  use Buildel.Blocks.Block

  alias Buildel.Pipelines
  alias Buildel.Pipelines.Pipeline
  alias Buildel.Organizations

  @impl true
  def options() do
    %{
      type: "workflow_call",
      description: "A block that allows you to call a workflow from within another workflow.",
      groups: ["tools", "utils"],
      inputs: [Block.text_input("stop_run")],
      outputs: [],
      ios: [],
      dynamic_ios: "/api/organizations/{{organization_id}}/pipelines/{{opts.workflow}}/ios",
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
        "opts" =>
          options_schema(%{
            "required" => ["workflow"],
            "properties" =>
              Jason.OrderedObject.new(
                workflow: %{
                  "type" => "string",
                  "title" => "Workflow",
                  "description" => "The workflow to call.",
                  "url" => "/api/organizations/{{organization_id}}/pipelines",
                  "presentAs" => "async-select",
                  "minLength" => 1,
                  "readonly" => true
                }
              )
          })
      }
    }
  end

  def setup(
        %{
          context_id: _context_id,
          type: __MODULE__,
          opts: opts,
          connections: _connections
        } = state
      ) do
    workflow_id = opts.workflow |> String.to_integer()
    {:ok, state |> Map.put(:workflow_id, workflow_id)}
  end

  def handle_external_input(topic, {_, message_type, payload, metadata}, state) do
    context = BlockPubSub.io_from_topic(topic)

    output(state, context.block <> ":" <> context.io, {message_type, payload}, %{
      metadata: metadata,
      stream_stop: :none
    })
  end

  def handle_stream_stop({topic, :stop_stream, _, _metadata}, state) do
    context = BlockPubSub.io_from_topic(topic)

    state = send_stream_stop(state, context.block <> ":" <> context.io)
    {:noreply, state}
  end

  @impl true
  def handle_input("stop_run", {_name, :text, _data, _metadata}, state) do
    Pipelines.Runner.stop_run(state[:run])
    state |> Map.delete(:run)
  end

  @impl true
  def handle_input(input_name, {_name, type, data, metadata}, state) do
    [block_name, input_name] = String.split(input_name, ":")

    %{global: organization_id} = block_context().context_from_context_id(state[:context_id])

    state =
      state
      |> Map.put_new_lazy(:run, fn ->
        run = state[:run] || create_and_start_run(organization_id, state[:workflow_id], %{})
        listen_to_outputs(run)
        run
      end)

    Buildel.BlockPubSub.broadcast_to_io(
      Pipelines.Worker.context_id(state[:run]),
      block_name,
      input_name,
      {type, data},
      metadata
      |> Map.put_new_lazy(:message_id, fn -> state[:message_id] || UUID.uuid4() end)
    )

    state
  end

  defp create_and_start_run(organization_id, pipeline_id, metadata) do
    with organization <- Organizations.get_organization!(organization_id),
         {:ok, %Pipeline{} = pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, config} <- Pipelines.get_pipeline_config(pipeline, "latest"),
         {:ok, run} <-
           Pipelines.create_run(%{
             pipeline_id: pipeline_id,
             config: config |> Map.put(:metadata, metadata)
           }),
         {:ok, run} <- Pipelines.Runner.start_run(run) do
      run
    else
      e -> e
    end
  end

  defp listen_to_outputs(run) do
    context_id = Pipelines.Worker.context_id(run)

    run
    |> Pipelines.blocks_for_run()
    |> Enum.map(fn block ->
      public_outputs = block.type.options.outputs |> Enum.filter(fn output -> output.public end)

      for output <- public_outputs do
        Buildel.BlockPubSub.subscribe_to_io(context_id, block.name, output.name)
      end
    end)
  end
end
