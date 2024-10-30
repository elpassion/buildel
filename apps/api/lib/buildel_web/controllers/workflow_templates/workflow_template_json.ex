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
      template_name: workflow_template.template_name,
      template_description: workflow_template.template_description,
      groups: workflow_template.groups,
      template_config: workflow_template.template_config
    }
  end
end
