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

  def create_pipeline_config_from_template(organization_id, template_name) do
    case template_name do
      "AI Chat" -> {:ok, generate_ai_chat_template_config(organization_id)}
      "Speech To Text" -> {:error, :not_found}
      "Text To Speech" -> {:error, :not_found}
      "Knowledge Search To Text" -> {:error, :not_found}
      _ -> {:error, :not_found}
    end
  end

  defp generate_text_input_block(attrs) do
    Map.merge(
      %{
        type: "text_input",
        name: "text_input_1",
        connections: [],
        inputs: [],
        opts: %{},
        position: %{x: 0, y: -500}
      },
      attrs
    )
  end

  defp generate_chat_block(attrs) do
    Map.merge(
      %{
        type: "chat",
        name: "chat_1",
        connections: [],
        inputs: [],
        opts: %{},
        position: %{x: 400, y: -500}
      },
      attrs
    )
  end

  defp generate_text_output_block(attrs) do
    Map.merge(
      %{
        type: "text_output",
        name: "text_output_1",
        connections: [],
        inputs: [],
        opts: %{},
        position: %{x: 800, y: -500}
      },
      attrs
    )
  end

  def generate_ai_chat_template_config(organization_id) do
    %{
      name: "AI Chat",
      organization_id: organization_id,
      config: %{
        blocks: [
          generate_text_input_block(%{position: %{x: 0, y: -500}}),
          generate_chat_block(%{
            connections: [
              %{
                from: %{
                  block_name: "text_input_1",
                  output_name: "output"
                },
                to: %{
                  block_name: "chat_1",
                  input_name: "input"
                },
                opts: %{reset: true}
              }
            ],
            inputs: ["text_input_1:output->input?reset=true"],
            position: %{x: 400, y: -500}
          }),
          generate_text_output_block(%{
            connections: [
              %{
                from: %{
                  block_name: "chat_1",
                  output_name: "output"
                },
                to: %{
                  block_name: "text_output_1",
                  input_name: "input"
                },
                opts: %{reset: true}
              }
            ],
            inputs: ["chat_1:output->input?reset=true"],
            position: %{x: 800, y: -500}
          })
        ],
        connections: [
          %{
            from: %{
              block_name: "text_input_1",
              output_name: "output"
            },
            to: %{
              block_name: "chat_1",
              input_name: "input"
            },
            opts: %{reset: true}
          },
          %{
            from: %{
              block_name: "chat_1",
              output_name: "output"
            },
            to: %{
              block_name: "text_output_1",
              input_name: "input"
            },
            opts: %{reset: true}
          }
        ],
        version: "1"
      }
    }
  end
end
