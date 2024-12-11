defmodule Buildel.Blocks.NewWorkflowCall do
  alias Buildel.Organizations
  alias Buildel.Pipelines.Pipeline
  alias Buildel.Pipelines
  use Buildel.Blocks.NewBlock

  defblock(:workflow_call, description: "", groups: ["inputs / outputs"])

  defdynamicios()

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

  defoption(:inputs, %{
    "type" => "array",
    "title" => "Inputs",
    "description" =>
      "Which inputs should be filled while calling workflow (by default no inputs are sent)",
    "minItems" => 0,
    "items" => %{
      "type" => "object",
      "required" => ["input_name", "required"],
      "properties" => %{
        "input_name" => %{
          "type" => "string",
          "title" => "Input",
          "url" =>
            "/api/organizations/{{organization_id}}/pipelines/{{pipeline_id}}/blocks/{{block_name}}/options/inputs?workflow={{opts.workflow}}",
          "presentAs" => "async-select",
          "minLength" => 1
        },
        "description" => %{
          "type" => "string",
          "title" => "Description",
          "default" => "Input used to call workflow"
        },
        "title" => %{
          "type" => "string",
          "title" => "Title",
          "default" => ""
        },
        "required" => %{
          "type" => "boolean",
          "title" => "Required",
          "default" => false
        }
      }
    },
    "default" => [],
    "displayWhen" => %{
      "connections" => %{
        "call_worker" => %{
          "min" => 1
        }
      }
    }
  })

  defoption(
    :wait_for_outputs,
    %{
      "type" => "array",
      "title" => "Wait for Outputs",
      "description" => "Which outputs should be waited for when calling as tool",
      "minItems" => 1,
      "items" => %{
        "type" => "object",
        "required" => ["output_name"],
        "properties" => %{
          "output_name" => %{
            "type" => "string",
            "title" => "Output",
            "url" =>
              "/api/organizations/{{organization_id}}/pipelines/{{pipeline_id}}/blocks/{{block_name}}/options/outputs?workflow={{opts.workflow}}",
            "presentAs" => "async-select",
            "minLength" => 1
          }
        }
      },
      "default" => [],
      "displayWhen" => %{
        "connections" => %{
          "call_worker" => %{
            "min" => 1
          }
        }
      }
    },
    required: false
  )

  deftool(:call, description: "Call another workflow", schema: %{})

  def handle_get_tool(:call, state) do
    tool = @tools |> Enum.find(&(&1.name == :call))

    inputs =
      with dynamic_pipeline_id <- option(state, :workflow),
           organization <-
             Buildel.Organizations.get_organization!(state.block.context.context.global),
           {:ok, dynamic_pipeline} <-
             Buildel.Pipelines.get_organization_pipeline(organization, dynamic_pipeline_id) do
        BuildelWeb.OrganizationPipelineJSON.ios(%{pipeline: dynamic_pipeline}).data.inputs
      else
        _ -> []
      end

    schema =
      option(state, :inputs)
      |> Enum.map(fn input_def ->
        io_input = Enum.find(inputs, fn io_input -> io_input.name == input_def.input_name end)
        io_input = io_input |> Map.update!(:schema, fn schema ->
          title = case Map.get(input_def, :title) do
            nil -> input_def.input_name
            "" -> input_def.input_name
            title -> title
          end

          description = case Map.get(input_def, :description) do
            nil -> ""
            description -> description
          end
          schema
          |> Map.put("title", title)
          |> Map.put("description", description)
        end)

        %{
          required: input_def.required,
          input: io_input
        }
      end )
      |> Enum.reduce(%{"properties" => %{}, "required" => [], "type" => "object"}, fn
        %{required: false, input: input}, schema ->
          name = String.replace(input.name, ":", ".")
          update_in(schema["properties"], &Map.put(&1, name, input.schema))

        %{required: true, input: input}, schema ->
          name = String.replace(input.name, ":", ".")

          update_in(schema["properties"], &Map.put(&1, name, input.schema))
          |> Map.update!("required", &(&1 ++ [name]))
      end)

    %{tool | schema: schema}
  end

  def handle_dynamic_ios(%{organization: organization, pipeline: _pipeline, block: block}) do
    with dynamic_pipeline_id when not is_nil(dynamic_pipeline_id) <- block["opts"]["workflow"],
         {:ok, dynamic_pipeline} <-
           Buildel.Pipelines.get_organization_pipeline(organization, dynamic_pipeline_id) do
      BuildelWeb.OrganizationPipelineJSON.ios(%{pipeline: dynamic_pipeline})
    else
      _ -> []
    end
  end

  def handle_option(:workflow, %{organization: organization, pipeline: pipeline}) do
    pipelines = Pipelines.list_organization_pipelines(organization) |> List.delete(pipeline)

    BuildelWeb.OrganizationPipelineJSON.index(%{
      pipelines: pipelines,
      params: %Buildel.Pipelines.ListParams{},
      total: 0
    })
  end

  def handle_option(:outputs, %{
        organization: organization,
        pipeline: _pipeline,
        block: block,
        params: params
      }) do
    with dynamic_pipeline_id <- Map.merge(block["opts"], params)["workflow"],
         {:ok, dynamic_pipeline} <-
           Buildel.Pipelines.get_organization_pipeline(organization, dynamic_pipeline_id) do
      BuildelWeb.OrganizationPipelineJSON.ios(%{pipeline: dynamic_pipeline}).data.outputs
      |> Enum.filter(&(&1.public == true && &1.type == :text))
      |> Enum.map(&%{name: &1.name, id: &1.name})
      |> then(&%{data: &1})
    else
      _ -> []
    end
  end

  def handle_option(:inputs, %{
        organization: organization,
        pipeline: _pipeline,
        block: block,
        params: params
      }) do
    with dynamic_pipeline_id <- Map.merge(block["opts"], params)["workflow"],
         {:ok, dynamic_pipeline} <-
           Buildel.Pipelines.get_organization_pipeline(organization, dynamic_pipeline_id) do
      BuildelWeb.OrganizationPipelineJSON.ios(%{pipeline: dynamic_pipeline}).data.inputs
      |> Enum.filter(&(&1.public == true))
      |> Enum.map(&%{name: &1.name, id: &1.name})
      |> then(&%{data: &1})
    else
      _ -> []
    end
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

  def handle_tool_call(:call, message, state) do
    response =
      fn ->
        send_stream_start(state, :call, message)

        result =
          Task.async(fn ->
            result =
              Buildel.Pipelines.Runner.build_complete_run(
                state.block.context.context.global,
                option(state, :workflow),
                option(state, :wait_for_outputs)
                |> Enum.map(fn output ->
                  [block_name, output_name] = output.output_name |> String.split(":")
                  %{block_name: block_name, output_name: output_name}
                end),
                message.message.args
                |> Enum.map(fn {input_name, data} ->
                  [block_name, input_name] = String.split(input_name, ".")

                  %{
                    block_name: block_name,
                    input_name: input_name,
                    message:
                      Message.from_message(message)
                      |> Message.set_type(:text)
                      |> Message.set_message(data)
                  }
                end)
              ).()

            Message.from_message(message)
            |> Message.set_type(:json)
            |> Message.set_message(result)
          end)
          |> Task.await(5 * 60_000)

        send_stream_stop(state, :call, message)

        result
      end

    {:ok, response, state}
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
