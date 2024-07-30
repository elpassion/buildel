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
      groups: ["tools"],
      inputs: [],
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

  @impl true
  def handle_input("input", {_name, :text, text, _metadata}, state) do
    # %{global: organization_id} = block_context().context_from_context_id(state[:context_id])
    # run = create_and_start_run(organization_id, state.workflow_id, %{})
    # listen_to_outputs(run) |> IO.inspect(label: "listen_to_outputs")

    # opts = Map.merge(%{stream_stop: :send, metadata: %{}}, %{})

    # Buildel.BlockPubSub.broadcast_to_io(
    #   Pipelines.Worker.context_id(run),
    #   "text_input_1",
    #   "input",
    #   {:text, text},
    #   opts.metadata
    #   |> Map.put_new_lazy(:message_id, fn -> state[:message_id] || UUID.uuid4() end)
    # )

    # outputs = [
    #   %{
    #     block_name: "text_output_1",
    #     output_name: "output",
    #     topic:
    #       BlockPubSub.io_topic(
    #         Pipelines.Worker.context_id(run),
    #         "text_output_1",
    #         "output"
    #       ),
    #     data: nil
    #   }
    # ]

    # results =
    #   Enum.reduce_while(Stream.repeatedly(fn -> nil end), outputs, fn _, outputs ->
    #     outputs = receive_output(outputs)

    #     if Enum.any?(outputs, &(&1.data == nil)) do
    #       {:cont, outputs}
    #     else
    #       {:halt, outputs}
    #     end
    #   end)
    #   |> IO.inspect(label: "outputs")

    output(state, "output", {:text, text})
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
    # add listening only to outputs chosed in opts
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

  defp receive_output([]), do: []

  defp receive_output(outputs) do
    topics = outputs |> Enum.map(& &1[:topic])

    receive do
      {topic, type, data, _metadata} when type != :start_stream and type != :stop_stream ->
        if topic in topics do
          outputs
          |> update_in(
            [
              Access.at(Enum.find_index(outputs, fn output -> output[:topic] == topic end)),
              :data
            ],
            fn _ -> data end
          )
        else
          outputs
        end

      _other ->
        outputs
    end
  end
end
