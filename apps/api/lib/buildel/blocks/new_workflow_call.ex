defmodule Buildel.Blocks.NewWorkflowCall do
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

  def handle_dynamic_inputs(%{organization: organization, pipeline: _pipeline, block: block}) do
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
    {:ok, state}
  end

  def input(state, _input_name, _message) do
    {:ok, state}
  end
end
