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
      template_description: "Allows to upload audio file and receive transcription"
    },
    %{
      name: "Text To Speech",
      template_name: "text_to_speech",
      template_description: "Allows to generate audio files from provided text"
    },
    %{
      name: "Knowledge Search To Text",
      template_name: "knowledge_search_to_text",
      template_description: "Allows to analyse given documents and receive i.e. summary or answer questions"
    },
    %{
      name: "Spreadsheet AI Assistant",
      template_name: "spreadsheet_ai_assistant",
      template_description: "Interact with a spreadsheet database using plain language. No need for SQL"
    },
    %{
      name: "Text Classification",
      template_name: "text_classification_assistant",
      template_description: "Text classifier assistant that convert text into one or more categories"
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

      "spreadsheet_ai_assistant" ->
        {:ok, generate_spreadsheet_ai_assistant_config(organization_id)}

      "text_classification_assistant" ->
        {:ok, generate_text_classification_assistant(organization_id)}

      _ ->
        {:error, :not_found}
    end
  end


  def generate_text_classification_assistant(organization_id) do
    %{
      name: "Text Classification",
      organization_id: organization_id,
      config: %{
        blocks: [
          generate_comment_block(%{name: "comment_1", measured: %{ width: 324, height: 231 }, position: %{x: 397, y: -767}, opts: %{color: "transparent", content: "<h3>The LLM will analyze the provided text and classify it.</h3><p class=\"!my-0\">The returned output will follow this format:</p><pre><code>{\n categories: string[],\n keywords: string[]\n}</code></pre>"}}),
          generate_text_input_block(%{position: %{x: -96, y: -501}}),
          generate_chat_block(%{
            position: %{x: 363, y: -500},
            opts: %{
              api_type: "openai",
              endpoint: "https://api.openai.com/v1",
              model: "gpt-4o-mini",
              system_message: "You are a text classification assistant.\n\nYour task is to assign one or more categories to the input text and output in json. \n\nAdditionally, you need to extract the keywords from the text that are related to the classification.",
              prompt_template: "--- Text Data\n\n{{text_input_1:output}}\n\n---",
              messages: [
                %{
                  content: "The staff was great. The receptionists were very helpful and answered all our questions. The room was clean and bright, and the room service was always on time. Will be coming back! Thank you so much",
                  role: "user"
                },
                %{
                  content: "{\n  \"categories\":[\"customerfeedback\",\"hospitality\",\"hotelreview\"],\n  \"keywords\": [\"staff\",\"receptionists\",\"helpful\",\"clean\",\"bright\",\n    \"roomservice\", \"comingback\"]\n}",
                  role: "assistant"
                }
              ]
            }
          }),
          generate_text_output_block(%{
            position: %{x: 909.8641992600402, y: -500.4424284352723}
          }),
        ],
        connections: [
          create_connection("chat_1", "text_output_1"),
          create_connection("text_input_1", "chat_1")
        ],
        version: "1"
      },
      interface_config: %{
        webchat: %{
          inputs: [%{name: "text_input_1", type: "text_input"}],
          outputs: [%{name: "text_output_1", type: "text_output"}],
          public: true
        }
      },
    }
  end


  def generate_spreadsheet_ai_assistant_config(organization_id) do
    %{
      name: "Spreadsheet AI Assistant",
      organization_id: organization_id,
      config: %{
        blocks: [
          generate_comment_block(%{name: "comment_1", measured: %{ width: 444, height: 136 }, position: %{x: 72.70172870895723, y: 612.1249090138265}, opts: %{color: "transparent", content: "<h3>1️⃣ Upload a <em>csv </em>file.</h3><p class=\"!my-0\"><strong>Csv Search </strong>block will transform it to <strong><em>sql table</em></strong> which you can query using plain language.</p>"}}),
          generate_comment_block(%{name: "comment_2", measured: %{ width: 420, height: 100 }, position: %{x: -444.12958728294683, y: 258.0269565163127}, opts: %{color: "transparent", content: "<h3>2️⃣ Ask a question related to uploaded csv</h3><p class=\"!my-0\"></p>"}}),
          generate_comment_block(%{name: "comment_3", measured: %{ width: 317, height: 100 }, position: %{x: 608.9786421045233, y: -92.06833526716287}, opts: %{color: "transparent", content: "<h3>3️⃣ See the result here or use Chat interface at the bottom right corner 💬</h3>"}}),
          generate_text_input_block(%{position: %{x: -379.55131538331705, y: 13.436342970687974}}),
          generate_chat_block(%{
            position: %{x: 97.85012452954305, y: 12.316129078621316},
            opts: %{
              api_type: "openai",
              endpoint: "https://api.openai.com/v1",
              model: "gpt-4o-mini",
              system_message: "You are a helpful assistant.\n\nI will ask you some questions, and your task is to answer them using the available tools.\n\nUse only the columns and tables that are available to you in the csv_search_1 tool.\n"
            }
          }),
          generate_text_output_block(%{
            position: %{x: 623.2559677436357, y: 11.849821588457274}
          }),
          generate_csv_search_block(%{
            position: %{x: 147.51618004216198, y: 487.51810456220926}
          }),
          generate_file_input_block(%{
            position: %{x: -257.2287000627205, y: 489.40803075806616}
          })
        ],
        connections: [
          create_connection("chat_1", "text_output_1"),
          create_tool_connection("csv_search_1", "chat_1"),
          create_connection("file_input_1", "csv_search_1"),
          create_connection("text_input_1", "chat_1")
        ],
        version: "1"
      },
      interface_config: %{
        webchat: %{
          inputs: [%{name: "file_input_1", type: "file_input"}, %{name: "text_input_1", type: "text_input"}],
          outputs: [%{name: "text_output_1", type: "text_output"}],
          public: true
        }
      },
    }
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

  defp generate_comment_block(attrs) do
    Map.merge(
      %{
        type: "comment",
        name: "comment_1",
        connections: [],
        inputs: [],
        measured: %{ width: 420, height: 100 },
        opts: %{
          content: "Content of the comment block",
          color: "transparent"
        },
        position: %{x: 0, y: -500}
      },
      attrs
    )
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

  defp generate_csv_search_block(attrs) do
    Map.merge(
      %{
        type: "csv_search",
        name: "csv_search_1",
        connections: [],
        inputs: [],
        opts: %{},
        position: %{x: 400, y: -500}
      },
      attrs
    )
  end

  defp generate_file_input_block(attrs) do
    Map.merge(
      %{
        type: "file_input",
        name: "file_input_1",
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

  defp create_tool_connection(from, to) do
    %{
      from: %{
        block_name: from,
        output_name: "tool"
      },
      to: %{
        block_name: to,
        input_name: "tool"
      },
      opts: %{reset: true}
    }
  end
end
