defmodule Buildel.Costs.CostCalculator do
  def calculate_chat_cost(%Buildel.Langchain.ChatTokenSummary{model: model}) when is_nil(model),
    do: Decimal.new("0.0")

  def calculate_chat_cost(%Buildel.Langchain.ChatTokenSummary{model: model} = chat_token_summary) do
    %{input_token_price: input_token_price, output_token_price: output_token_price} =
      prices(model)

    input_tokens_cost = Decimal.mult(input_token_price, chat_token_summary.input_tokens)
    output_tokens_cost = Decimal.mult(output_token_price, chat_token_summary.output_tokens)

    Decimal.add(input_tokens_cost, output_tokens_cost)
  end

  defp prices(model) do
    %{
      "gpt-3.5-turbo" => %{
        input_token_price: Decimal.new("0.0030") |> Decimal.div(1000),
        output_token_price: Decimal.new("0.0060") |> Decimal.div(1000)
      },
      "gpt-3.5-turbo-1106" => %{
        input_token_price: Decimal.new("0.0010") |> Decimal.div(1000),
        output_token_price: Decimal.new("0.0020") |> Decimal.div(1000)
      },
      "gpt-4" => %{
        input_token_price: Decimal.new("0.03") |> Decimal.div(1000),
        output_token_price: Decimal.new("0.06") |> Decimal.div(1000)
      },
      "gpt-4-1106-preview" => %{
        input_token_price: Decimal.new("0.01") |> Decimal.div(1000),
        output_token_price: Decimal.new("0.03") |> Decimal.div(1000)
      },
      "gpt-4-turbo-preview" => %{
        input_token_price: Decimal.new("0.01") |> Decimal.div(1000),
        output_token_price: Decimal.new("0.03") |> Decimal.div(1000)
      }
    }
    |> Map.get(model, %{
      input_token_price: 0,
      output_token_price: 0
    })
  end
end
