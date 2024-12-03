defmodule Buildel.Blocks.NewIF do
  use Buildel.Blocks.NewBlock

  defblock(:if,
    description: "Use this block to compare the input to a condition and forward the input to the true or false output.",
    groups: ["utils"]
  )

  definput(:input, schema: %{})

  defoutput(:true, schema: %{})
  defoutput(:false, schema: %{})

  defoption(
    :condition,
    %{
      "type" => "string",
      "title" => "Condition",
      "description" => "The value to compare the input to.",
      "minLength" => 1
    }
  )

  def handle_input(:input, %Message{message: text, type: :text} = message, state) do
    output = compare(text, state)

    output(state, String.to_atom(output), message)

    {:ok, state}
  end

  defp compare(text_value, state) do
    if text_value |> String.trim() == option(state, :condition) do
      "true"
    else
      "false"
    end
  end
end
