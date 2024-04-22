defmodule BuildelWeb.WorkflowTemplateJSON do
  def index(%{workflow_templates: workflow_templates}) do
    %{data: for(workflow_template <- workflow_templates, do: data(workflow_template))}
  end

  def create(%{pipeline: pipeline}) do
    %{
      data: %{
        pipeline_id: pipeline.id
      }
    }
  end

  defp data(workflow_template) do
    %{
      name: workflow_template.name,
      template_name: workflow_template.template_name
    }
  end
end
