defmodule BuildelWeb.WorkflowTemplateJSON do
  def index(%{workflow_templates: workflow_templates}) do
    %{data: for(workflow_template <- workflow_templates, do: data(workflow_template))}
  end

  def show(%{workflow_template: workflow_template}) do
    %{data: data(workflow_template)}
  end

  defp data(workflow_template) do
    %{
      name: workflow_template.name
    }
  end
end
