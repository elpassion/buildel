defmodule Buildel.Blocks.NewApiCallTool do
  alias Buildel.Blocks.Fields.EditorField
  alias EditorField.Suggestion
  use Buildel.Blocks.NewBlock

  defblock(:api_call_tool,
    description: "Tool used to call HTTP APIs.",
    groups: ["tools", "text"]
  )

  definput(:args, schema: %{"type" => "object"})
  defoutput(:output, schema: %{})

  defoption(:method, %{
    type: "string",
    title: "Method",
    description: "The HTTP method to use for the request.",
    enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    enumPresentAs: "radio",
    default: "GET",
    readonly: true
  })

  defoption(:url, %{
    type: "string",
    title: "URL",
    description:
      "The URL to send the request to. If you want to use a variable, use `{{variable_name}}`. Notice the double curly braces!",
    minLength: 1,
    readonly: true
  })

  defoption(
    :parameters,
    EditorField.new(%{
      title: "Parameters",
      description:
        "Valid JSONSchema definition of the parameters passed to api call. Always pass a JSON object schema. i.e. `{\"type\": \"object\", \"properties\": {\"name\": {\"type\": \"string\"}}, \"required\": [\"name\"]}`.",
      editorLanguage: "json",
      default: "{\"type\": \"object\", \"properties\": {}, \"required\": []}",
      minLength: 1
    })
  )

  defoption(
    :headers,
    EditorField.new(%{
      title: "Headers",
      description:
        "Valid JSON object of the headers to be sent with the request. i.e. `{\"Content-Type\": \"application/json\"}`.",
      editorLanguage: "json",
      default: "{\"Content-Type\": \"application/json\", \"Accept\": \"application/json\"}",
      minLength: 1,
      suggestions: [
        Suggestion.inputs(),
        Suggestion.metadata(),
        Suggestion.secrets()
      ]
    })
  )

  def handle_input(:args, %Message{} = message, state) do
    {:ok, state}
  end
end
