defmodule Buildel.WorkflowTemplates do
  @available_templates [
    "AI Chat",
    "Speech To Text",
    "Text To Speech",
    "Knowledge Search To Text"
  ]

  def get_workflow_template_names() do
    Enum.map(@available_templates, fn template_name -> %{name: template_name} end)
  end
end
