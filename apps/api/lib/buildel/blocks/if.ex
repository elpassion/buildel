defmodule Buildel.Blocks.IF do
  use Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "if",
      description:
        "Use this block to compare the input to a condition and forward the input to the true or false output.",
      groups: ["utils"],
      inputs: [Block.text_input()],
      outputs: [Block.text_output("true"), Block.text_output("false")],
      ios: [],
      dynamic_ios: nil,
      schema: schema()
    }
  end

  @impl true
  def schema() do
    %{
      "type" => "object",
      "required" => ["name", "inputs", "opts"],
      "properties" => %{
        "name" => name_schema(),
        "inputs" => inputs_schema(),
        "opts" =>
          options_schema(%{
            "required" => ["condition"],
            "properties" => %{
              condition: %{
                "type" => "string",
                "title" => "Condition",
                "description" => "The value to compare the input to.",
                "minLength" => 1
              }
            }
          })
      }
    }
  end

  defp compare(text_value, state) do
    output =
      if to_string(text_value) == state.opts.condition do
        "true"
      else
        "false"
      end

    output(state, output, {:text, text_value})
  end

  @impl true
  def handle_input("input", {_name, :text, text, _metadata}, state) do
    compare(text, state)
  end
end
