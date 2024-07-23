defmodule Buildel.WorkflowTemplates do
  @available_templates [
    %{
      name: "AI Chat",
      template_name: "ai_chat",
      template_description: "Basic workflow with any of supported models"
    },
    %{
      name: "Speech To Text",
      template_name: "speech_to_text",
      template_description: "Allows to upload MP3 file and receive transcription"
    },
    %{
      name: "Text To Speech",
      template_name: "text_to_speech",
      template_description: "Allow to generate MP3 file from provided text"
    },
    %{
      name: "Knowledge Search To Text",
      template_name: "knowledge_search_to_text",
      template_description: "Allows to analyse given documents and receive i.e. summary or answer questions"
    }
  ]

  def get_workflow_template_names() do
    @available_templates
  end

  def create_pipeline_config_from_template(organization_id, template_name) do
    case template_name do
      "ai_chat" ->
        {:ok, generate_ai_chat_template_config(organization_id)}

      "speech_to_text" ->
        {:ok, generate_speech_to_text_template_config(organization_id)}

      "text_to_speech" ->
        {:ok, generate_text_to_speech_template_config(organization_id)}

      "knowledge_search_to_text" ->
        {:ok, generate_document_search_template_config(organization_id)}

      _ ->
        {:error, :not_found}
    end
  end

  def generate_document_search_template_config(organization_id) do
    %{
      name: "Knowledge Search To Text",
      organization_id: organization_id,
      config: %{
        blocks: [
          generate_text_input_block(%{position: %{x: 0, y: -500}}),
          generate_document_search_block(%{
            connections: [
              create_connection("text_input_1", "document_search_1")
            ],
            inputs: ["text_input_1:output->input?reset=true"],
            position: %{x: 400, y: -500}
          }),
          generate_text_output_block(%{
            connections: [
              create_connection("document_search_1", "text_output_1")
            ],
            inputs: ["document_search_1:output->input?reset=true"],
            position: %{x: 800, y: -500}
          })
        ],
        connections: [
          create_connection("text_input_1", "document_search_1"),
          create_connection("document_search_1", "text_output_1")
        ],
        version: "1"
      }
    }
  end

  def generate_text_to_speech_template_config(organization_id) do
    %{
      name: "Text To Speech",
      organization_id: organization_id,
      config: %{
        blocks: [
          generate_text_input_block(%{position: %{x: 0, y: -500}}),
          generate_text_to_speech_block(%{
            connections: [
              create_connection("text_input_1", "text_to_speech_1")
            ],
            inputs: ["text_input_1:output->input?reset=true"],
            position: %{x: 400, y: -500}
          }),
          generate_audio_output_block(%{
            connections: [
              create_connection("text_to_speech_1", "audio_output_1")
            ],
            inputs: ["text_to_speech_1:output->input?reset=true"],
            position: %{x: 800, y: -500}
          })
        ],
        connections: [
          create_connection("text_input_1", "text_to_speech_1"),
          create_connection("text_to_speech_1", "audio_output_1")
        ],
        version: "1"
      }
    }
  end

  def generate_speech_to_text_template_config(organization_id) do
    %{
      name: "Speech To Text",
      organization_id: organization_id,
      config: %{
        blocks: [
          generate_audio_input_block(%{position: %{x: 0, y: -500}}),
          generate_speech_to_text_block(%{
            connections: [
              create_connection("audio_input_1", "speech_to_text_1")
            ],
            inputs: ["audio_input_1:output->input?reset=true"],
            position: %{x: 400, y: -500}
          }),
          generate_text_output_block(%{
            connections: [
              create_connection("speech_to_text_1", "text_output_1")
            ],
            inputs: ["speech_to_text_1:output->input?reset=true"],
            position: %{x: 800, y: -500}
          })
        ],
        connections: [
          create_connection("audio_input_1", "speech_to_text_1"),
          create_connection("speech_to_text_1", "text_output_1")
        ],
        version: "1"
      }
    }
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
              create_connection("text_input_1", "chat_1")
            ],
            inputs: ["text_input_1:output->input?reset=true"],
            position: %{x: 400, y: -500}
          }),
          generate_text_output_block(%{
            connections: [
              create_connection("chat_1", "text_output_1")
            ],
            inputs: ["chat_1:output->input?reset=true"],
            position: %{x: 800, y: -500}
          })
        ],
        connections: [
          create_connection("text_input_1", "chat_1"),
          create_connection("chat_1", "text_output_1")
        ],
        version: "1"
      }
    }
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

  defp generate_audio_input_block(attrs) do
    Map.merge(
      %{
        type: "audio_input",
        name: "audio_input_1",
        connections: [],
        inputs: [],
        opts: %{},
        position: %{x: 0, y: -500}
      },
      attrs
    )
  end

  defp generate_audio_output_block(attrs) do
    Map.merge(
      %{
        type: "audio_output",
        name: "audio_output_1",
        connections: [],
        inputs: [],
        opts: %{},
        position: %{x: 0, y: -500}
      },
      attrs
    )
  end

  defp generate_speech_to_text_block(attrs) do
    Map.merge(
      %{
        type: "speech_to_text",
        name: "speech_to_text_1",
        connections: [],
        inputs: [],
        opts: %{},
        position: %{x: 400, y: -500}
      },
      attrs
    )
  end

  defp generate_text_to_speech_block(attrs) do
    Map.merge(
      %{
        type: "text_to_speech",
        name: "text_to_speech_1",
        connections: [],
        inputs: [],
        opts: %{},
        position: %{x: 400, y: -500}
      },
      attrs
    )
  end

  defp generate_document_search_block(attrs) do
    Map.merge(
      %{
        type: "document_search",
        name: "document_search_1",
        connections: [],
        inputs: [],
        opts: %{},
        position: %{x: 400, y: -500}
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

  defp create_connection(from, to) do
    %{
      from: %{
        block_name: from,
        output_name: "output"
      },
      to: %{
        block_name: to,
        input_name: "input"
      },
      opts: %{reset: true}
    }
  end
end
