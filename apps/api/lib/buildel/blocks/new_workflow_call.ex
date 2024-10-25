defmodule Buildel.Blocks.NewWorkflowCall do
  alias Buildel.Organizations
  alias Buildel.Pipelines.Pipeline
  alias Buildel.Pipelines
  use Buildel.Blocks.NewBlock

  defblock(:workflow_call, description: "", groups: [])

  defoption(:workflow, %{
    "type" => "string",
    "title" => "Workflow",
    "description" => "The workflow to call.",
    "url" =>
      "/api/organizations/{{organization_id}}/pipelines/{{pipeline_id}}/blocks/{{block_name}}/options/workflow",
    "presentAs" => "async-select",
    "minLength" => 1,
    "readonly" => true
  })

  defdynamicios()

  def handle_dynamic_ios(%{organization: organization, pipeline: _pipeline, block: block}) do
    with dynamic_pipeline_id <- block["opts"]["workflow"],
         {:ok, dynamic_pipeline} <-
           Buildel.Pipelines.get_organization_pipeline(organization, dynamic_pipeline_id) do
      BuildelWeb.OrganizationPipelineJSON.ios(%{pipeline: dynamic_pipeline})
    else
      _ -> []
    end
  end

  def handle_option(:workflow, %{organization: organization, pipeline: pipeline}) do
    pipelines = Pipelines.list_organization_pipelines(organization) |> List.delete(pipeline)
    BuildelWeb.OrganizationPipelineJSON.index(%{pipelines: pipelines})
  end

  def handle_input(dynamic_input, message, state) do
    [block_name, input_name] = dynamic_input |> String.split(":")

    state =
      state
      |> Map.put_new_lazy(:run, fn ->
        run =
          state[:run] ||
            create_and_start_run(
              state.block.context.context.global,
              option(state, :workflow),
              %{}
            )

        listen_to_outputs(run)
        run
      end)

    Buildel.BlockPubSub.broadcast_to_io(
      Pipelines.Worker.context_id(state[:run]),
      block_name,
      input_name,
      message
    )

    {:ok, state}
  end

  def handle_external_input(dynamic_input, %Message{topic: _topic} = message, state) do
    output(state, dynamic_input, message, stream_stop: :none)

    {:ok, state}
  end

  def handle_external_input_stream_start(dynamic_input, %Message{topic: _topic} = message, state) do
    send_stream_start(state, dynamic_input, message)

    {:ok, state}
  end

  def handle_external_input_stream_stop(dynamic_input, %Message{topic: _topic} = message, state) do
    send_stream_stop(state, dynamic_input, message)

    {:ok, state}
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
      public_outputs =
        block.type.options.outputs |> Enum.filter(fn output -> output.public end)

      for output <- public_outputs do
        Buildel.BlockPubSub.subscribe_to_io(context_id, block.name, output.name)
      end
    end)
  end
end
