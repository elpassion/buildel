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
      template_description:
        "Allows to analyse given documents and receive i.e. summary or answer questions"
    },
    %{
      name: "Spreadsheet AI Assistant",
      template_name: "spreadsheet_ai_assistant",
      template_description:
        "Interact with a spreadsheet database using plain language. No need for SQL"
    },
    %{
      name: "Text Classification",
      template_name: "text_classification_assistant",
      template_description:
        "Text classifier assistant that convert text into one or more categories"
    },
    %{
      name: "Feedback Assistant",
      template_name: "text_feedback_assistant",
      template_description:
        "Text feedback assistant that analyze the provided text and provide feedback"
    },
    %{
      name: "SEO Image for Article",
      template_name: "seo_image_for_article",
      template_description:
        "Template that generates an image from the article content"
    },
    %{
      name: "Blog post generator",
      template_name: "blog_post_generator",
      template_description:
        "Template that generates a blog post from the give topic"
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

      "text_feedback_assistant" ->
        {:ok, generate_text_feedback_assistant(organization_id)}

      "seo_image_for_article" ->
        {:ok, generate_seo_image_for_article_template_config(organization_id)}

      "blog_post_generator" ->
        {:ok, generate_blog_post_generator_template_config(organization_id)}

      _ ->
        {:error, :not_found}
    end
  end

  def generate_blog_post_generator_template_config(organization_id) do
    %{
      name: "Blog post generator",
      organization_id: organization_id,
      config: %{
        blocks: [
          generate_comment_block(%{
            name: "comment_1",
            measured: %{width: 372, height: 106},
            position: %{x: 173, y: 270},
            opts: %{
              color: "transparent",
              content: "<h3>1️⃣ Topic input</h3><p class=\"!my-0\">Write a topic for blog post generation.</p>"
            }
          }),
          generate_comment_block(%{
            name: "comment_2",
            measured: %{width: 411, height: 106},
            position: %{x: 702.7882055060337, y: 250.44334678883854},
            opts: %{
              color: "transparent",
              content: "<h3>2️⃣ Blog post generator</h3><p class=\"!my-0\">An LLM will search for materials on the internet using the Brave search engine and generate a blog post for you.</p>"
            }
          }),
          generate_comment_block(%{
            name: "comment_3",
            measured: %{width: 405, height: 128},
            position: %{x: 1239, y: 245},
            opts: %{
              color: "transparent",
              content:
                "<h3>3️⃣ Blog post output</h3><p class=\"!my-0\">You will receive the generated blog post here. You can also use the <em>chat interface</em> in the bottom right corner to interact with the workflow 💬</p>"
            }
          }),
          generate_chat_block(%{
            name: "blog_post_generator",
            position: %{x: 724, y: 377},
            opts: %{
              api_type: "openai",
              endpoint: "https://api.openai.com/v1",
              model: "gpt-4o-mini",
              api_key: "__openai",
              system_message:
                "You are a blog post generator. Create a well-researched and engaging blog post on the given topic. \n\nUse available tools for research and ensure the content is accurate and easy to read. \n\nStructure the post with an introduction, body, and conclusion.\n\nAt the end, generate table of contents.",
              prompt_template: "---Topic---\n{{blog_post_topic:output}}",
              chat_memory_type: "off"
            }
          }),
          generate_brave_search_block(%{
            name: "search_engine",
            position: %{x: 747.8680072308515, y: 900.2799058805016},
            opts: %{
              call_formatter: "",
              api_key: "__brave",
              country: "us",
              limit: 5
            }
          }),
          generate_text_input_block(%{name: "blog_post_topic", position: %{x: 196.72755144278358, y: 380.09823605609165}}),
          generate_text_output_block(%{
            name: "blog_post_output",
            position: %{x: 1280, y: 382},
            opts: %{
              jq_filter: ".",
              stream_timeout: 5000000
            }
          }),
          generate_text_output_block(%{
            name: "text_output_2",
            position: %{x: 1279.802409527933, y: 975.0012418893893},
            opts: %{
              jq_filter: ".",
              stream_timeout: 5000000
            }
          })
        ],
        connections: [
          create_connection("blog_post_topic", "blog_post_generator"),
          create_tool_connection("search_engine", "blog_post_generator"),
          create_connection("search_engine", "text_output_2"),
          create_connection("blog_post_generator", "blog_post_output")
        ],
        version: "1"
      },
      interface_config: %{
        webchat: %{
          inputs: [%{name: "blog_post_topic", type: "text_input"}],
          outputs: [%{name: "blog_post_output", type: "text_output"}],
          public: true
        }
      }
    }
  end

  def generate_seo_image_for_article_template_config(organization_id) do
    %{
      name: "SEO Image for Article",
      organization_id: organization_id,
      config: %{
        blocks: [
          generate_comment_block(%{
            name: "comment_1",
            measured: %{width: 313, height: 105},
            position: %{x: 222, y: 192},
            opts: %{
              color: "transparent",
              content: "<h3>1️⃣ Send an article content</h3><p class=\"!my-0\">Send the content of the article that you want to generate an image for.</p>"
            }
          }),
          generate_comment_block(%{
            name: "comment_2",
            measured: %{width: 348, height: 112},
            position: %{x: 751, y: 166},
            opts: %{
              color: "transparent",
              content: "<h3>2️⃣ Article summary</h3><p class=\"!my-0\">LLM will summarize your article and prepare a prompt for an image generation tool.</p>"
            }
          }),
          generate_comment_block(%{
            name: "comment_3",
            measured: %{width: 313, height: 134},
            position: %{x: 758, y: 931},
            opts: %{
              color: "transparent",
              content:
                "<h3>3️⃣ Image generation</h3><p class=\"!my-0\">The image block will generate an image from the received prompt using the selected properties.</p>"
            }
          }),
          generate_comment_block(%{
            name: "comment_4",
            measured: %{width: 366, height: 130},
            position: %{x: 1283, y: 691},
            opts: %{
              color: "transparent",
              content:
                "<h3>4️⃣ Image output</h3><p class=\"!my-0\">You will receive the URL for the generated image here. You can also use the chat interface in the bottom right corner 💬</p>"
            }
          }),
          generate_chat_block(%{
            name: "article_summarizer",
            position: %{x: 722, y: 315},
            opts: %{
              api_type: "openai",
              endpoint: "https://api.openai.com/v1",
              model: "gpt-4o-mini",
              api_key: "__openai",
              system_message:
                "You are a helpful assistant specializing in creating SEO-friendly content. \n\nI will provide you with an article, and your task is to summarize it and create an optimized image suitable for SEO purposes using available tools.\n\nMake sure that summarization used for generating image is no longer than 1 sentence.\n\nPlease return only the image, ensuring it visually represents the key elements of the article.",
              prompt_template: "{{article_input:output}}",
              chat_memory_type: "off"
            }
          }),
          generate_image_block(%{
            name: "image_generator",
            position: %{x: 737, y: 801},
            opts: %{
              api_type: "openai",
              endpoint: "https://api.openai.com/v1",
              model: "dall-e-2",
              api_key: "__openai",
              call_formatter: "{{config.block_name}} Generate image 📑: {{config.args}}\n",
              quality: "standard",
              size: "512x512",
              style: "natural"
            }
          }),
          generate_text_input_block(%{name: "article_input", position: %{x: 232, y: 314}}),
          generate_text_output_block(%{
            name: "image_output",
            position: %{x: 1319.888504242735, y: 838.3725672410218},
            opts: %{
              jq_filter: ".",
              stream_timeout: 5000000
            }
          }),
          generate_text_output_block(%{
            name: "text_output_2",
            position: %{x: 1319, y: 313},
            opts: %{
              jq_filter: ".",
              stream_timeout: 5000000
            }
          })
        ],
        connections: [
          create_connection("article_input", "article_summarizer"),
          create_tool_connection("image_generator", "article_summarizer"),
          create_connection(%{block_name: "image_generator", output_name: "image_url"}, %{block_name: "image_output", input_name: "input"}),
          create_connection("article_summarizer", "text_output_2")
        ],
        version: "1"
      },
      interface_config: %{
        form: %{
          inputs: [%{name: "article_input", type: "text_input"}],
          outputs: [%{name: "image_output", type: "text_output"}],
          public: true
        }
      }
    }
  end

  def generate_text_feedback_assistant(organization_id) do
    %{
      name: "Feedback Assistant",
      organization_id: organization_id,
      config: %{
        blocks: [
          generate_comment_block(%{
            name: "comment_1",
            measured: %{width: 211, height: 100},
            position: %{x: -300.5609264532254, y: -467.5377471106992},
            opts: %{
              color: "transparent",
              content: "<h3>1️⃣ Send an example essay in PDF format</h3>"
            }
          }),
          generate_comment_block(%{
            name: "comment_2",
            measured: %{width: 292, height: 100},
            position: %{x: 400.6049424336637, y: -608.8847889234336},
            opts: %{
              color: "transparent",
              content: "<h3>2️⃣ The LLM will analyze it and prepare feedback for you.</h3>"
            }
          }),
          generate_comment_block(%{
            name: "comment_3",
            measured: %{width: 319, height: 139},
            position: %{x: 1268.9991028385389, y: -641.8534980811221},
            opts: %{
              color: "transparent",
              content:
                "<h3>3️⃣ See the result here, or use the <em>form </em>interface.</h3><p class=\"!my-0\">You can access the <em>form</em> interface in the Interface tab.</p>"
            }
          }),
          generate_file_input_block(%{
            position: %{x: -321.5846160748752, y: -360.6756965729587}
          }),
          generate_file_to_text_block(%{
            position: %{x: 14.354944980161505, y: -500.63494532199496}
          }),
          generate_chat_block(%{
            position: %{x: 363, y: -500},
            opts: %{
              api_type: "openai",
              endpoint: "https://api.openai.com/v1",
              model: "gpt-4o-mini",
              api_key: "__openai",
              system_message:
                "You are a Feedback Assistant.\n\nI will send you an essay, and your job is to prepare feedback for it.\n\nRemember to:\n\n- Be conversational.\n- Be brief.\n- Evaluate on multiple criteria.\n- Respond in bullet points and markdown.\n- Prepare an overall summary at the end.",
              prompt_template: "{{file_to_text_1:output}}",
              chat_memory_type: "off"
            }
          }),
          generate_collect_all_text_block(%{
            position: %{x: 866.6742953609438, y: -384.35588667118367}
          }),
          generate_text_output_block(%{
            position: %{x: 1285.57960217244, y: -489.905306811496}
          })
        ],
        connections: [
          create_connection("file_input_1", "file_to_text_1"),
          create_connection("file_to_text_1", "chat_1"),
          create_connection("collect_all_text_1", "text_output_1"),
          create_connection("chat_1", "collect_all_text_1")
        ],
        version: "1"
      },
      interface_config: %{
        form: %{
          inputs: [%{name: "file_input_1", type: "file_input"}],
          outputs: [%{name: "text_output_1", type: "text_output"}],
          public: true
        }
      }
    }
  end

  def generate_text_classification_assistant(organization_id) do
    %{
      name: "Text Classification",
      organization_id: organization_id,
      config: %{
        blocks: [
          generate_comment_block(%{
            name: "comment_1",
            measured: %{width: 324, height: 231},
            position: %{x: 397, y: -767},
            opts: %{
              color: "transparent",
              content:
                "<h3>The LLM will analyze the provided text and classify it.</h3><p class=\"!my-0\">The returned output will follow this format:</p><pre><code>{\n categories: string[],\n keywords: string[]\n}</code></pre>"
            }
          }),
          generate_text_input_block(%{position: %{x: -96, y: -501}}),
          generate_chat_block(%{
            position: %{x: 363, y: -500},
            opts: %{
              api_type: "openai",
              endpoint: "https://api.openai.com/v1",
              model: "gpt-4o-mini",
              system_message:
                "You are a text classification assistant.\n\nYour task is to assign one or more categories to the input text and output in json. \n\nAdditionally, you need to extract the keywords from the text that are related to the classification.",
              prompt_template: "--- Text Data\n\n{{text_input_1:output}}\n\n---",
              messages: [
                %{
                  content:
                    "The staff was great. The receptionists were very helpful and answered all our questions. The room was clean and bright, and the room service was always on time. Will be coming back! Thank you so much",
                  role: "user"
                },
                %{
                  content:
                    "{\n  \"categories\":[\"customerfeedback\",\"hospitality\",\"hotelreview\"],\n  \"keywords\": [\"staff\",\"receptionists\",\"helpful\",\"clean\",\"bright\",\n    \"roomservice\", \"comingback\"]\n}",
                  role: "assistant"
                }
              ]
            }
          }),
          generate_text_output_block(%{
            position: %{x: 909.8641992600402, y: -500.4424284352723}
          })
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
      }
    }
  end

  def generate_spreadsheet_ai_assistant_config(organization_id) do
    %{
      name: "Spreadsheet AI Assistant",
      organization_id: organization_id,
      config: %{
        blocks: [
          generate_comment_block(%{
            name: "comment_1",
            measured: %{width: 444, height: 136},
            position: %{x: 72.70172870895723, y: 612.1249090138265},
            opts: %{
              color: "transparent",
              content:
                "<h3>1️⃣ Upload a <em>csv </em>file.</h3><p class=\"!my-0\"><strong>Csv Search </strong>block will transform it to <strong><em>sql table</em></strong> which you can query using plain language.</p>"
            }
          }),
          generate_comment_block(%{
            name: "comment_2",
            measured: %{width: 420, height: 100},
            position: %{x: -444.12958728294683, y: 258.0269565163127},
            opts: %{
              color: "transparent",
              content: "<h3>2️⃣ Ask a question related to uploaded csv</h3><p class=\"!my-0\"></p>"
            }
          }),
          generate_comment_block(%{
            name: "comment_3",
            measured: %{width: 317, height: 100},
            position: %{x: 608.9786421045233, y: -92.06833526716287},
            opts: %{
              color: "transparent",
              content:
                "<h3>3️⃣ See the result here or use Chat interface at the bottom right corner 💬</h3>"
            }
          }),
          generate_text_input_block(%{position: %{x: -379.55131538331705, y: 13.436342970687974}}),
          generate_chat_block(%{
            position: %{x: 97.85012452954305, y: 12.316129078621316},
            opts: %{
              api_type: "openai",
              endpoint: "https://api.openai.com/v1",
              model: "gpt-4o-mini",
              system_message:
                "You are a helpful assistant.\n\nI will ask you some questions, and your task is to answer them using the available tools.\n\nUse only the columns and tables that are available to you in the csv_search_1 tool.\n"
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
          inputs: [
            %{name: "file_input_1", type: "file_input"},
            %{name: "text_input_1", type: "text_input"}
          ],
          outputs: [%{name: "text_output_1", type: "text_output"}],
          public: true
        }
      }
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
        measured: %{width: 420, height: 100},
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

  defp generate_file_to_text_block(attrs) do
    Map.merge(
      %{
        type: "file_to_text",
        name: "file_to_text_1",
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

  defp generate_image_block(attrs) do
    Map.merge(
      %{
        type: "image",
        name: "image_1",
        connections: [],
        inputs: [],
        opts: %{},
        position: %{x: 400, y: -500}
      },
      attrs
    )
  end


  defp generate_brave_search_block(attrs) do
    Map.merge(
      %{
        type: "brave_search",
        name: "brave_search_1",
        connections: [],
        inputs: [],
        opts: %{},
        position: %{x: 400, y: -500}
      },
      attrs
    )
  end

  defp generate_collect_all_text_block(attrs) do
    Map.merge(
      %{
        type: "collect_all_text",
        name: "collect_all_text_1",
        connections: [],
        inputs: [],
        opts: %{},
        position: %{x: 800, y: -500}
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

  defp create_connection(%{block_name: _, output_name: _} = from, %{block_name: _, input_name: _} = to) do
    %{
      from: from,
      to: to,
      opts: %{reset: true}
    }
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
