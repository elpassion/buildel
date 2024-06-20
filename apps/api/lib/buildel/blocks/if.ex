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
      if text_value == state.opts.condition do
        "true"
      else
        "false"
      end

    [
      {:start_stream, output},
      {:output, output, {:text, text_value, %{}}},
      {:stop_stream, output}
    ]
  end

  def handle_input("input", {_name, :text, text, _metadata}) do
    [
      {:cast,
       fn get_state ->
         state = get_state.()
         compare(text, state)
       end}
    ]
  end
end
