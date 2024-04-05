defmodule Buildel.Costs.CostCalculator do
  require Logger

  def calculate_chat_cost(
        %Buildel.Langchain.ChatTokenSummary{model: model, endpoint: endpoint} = chat_token_summary
      ) do
    %{input_token_price: input_token_price, output_token_price: output_token_price} =
      prices({endpoint, model})

    input_tokens_cost = Decimal.mult(input_token_price, chat_token_summary.input_tokens)
    output_tokens_cost = Decimal.mult(output_token_price, chat_token_summary.output_tokens)

    Decimal.add(input_tokens_cost, output_tokens_cost)
  end

  defp prices({endpoint, model} = api_model) do
    %{
      {"https://api.openai.com/v1/chat/completions", "gpt-3.5-turbo"} => %{
        input_token_price: Decimal.new("0.0015") |> Decimal.div(1000),
        output_token_price: Decimal.new("0.0020") |> Decimal.div(1000)
      },
      {"https://api.openai.com/v1/chat/completions", "gpt-3.5-turbo-1106"} => %{
        input_token_price: Decimal.new("0.0010") |> Decimal.div(1000),
        output_token_price: Decimal.new("0.0020") |> Decimal.div(1000)
      },
      {"https://api.openai.com/v1/chat/completions", "gpt-3.5-turbo-0125"} => %{
        input_token_price: Decimal.new("0.0005") |> Decimal.div(1000),
        output_token_price: Decimal.new("0.0015") |> Decimal.div(1000)
      },
      {"https://api.openai.com/v1/chat/completions", "gpt-4"} => %{
        input_token_price: Decimal.new("0.03") |> Decimal.div(1000),
        output_token_price: Decimal.new("0.06") |> Decimal.div(1000)
      },
      {"https://api.openai.com/v1/chat/completions", "gpt-4-32k"} => %{
        input_token_price: Decimal.new("0.06") |> Decimal.div(1000),
        output_token_price: Decimal.new("0.12") |> Decimal.div(1000)
      },
      {"https://api.openai.com/v1/chat/completions", "gpt-4-1106-preview"} => %{
        input_token_price: Decimal.new("0.01") |> Decimal.div(1000),
        output_token_price: Decimal.new("0.03") |> Decimal.div(1000)
      },
      {"https://api.openai.com/v1/chat/completions", "gpt-4-turbo-preview"} => %{
        input_token_price: Decimal.new("0.01") |> Decimal.div(1000),
        output_token_price: Decimal.new("0.03") |> Decimal.div(1000)
      },
      {"https://api.mistral.ai/v1/chat/completions", "mistral-tiny"} => %{
        input_token_price: Decimal.new("0.1512") |> Decimal.div(1_000_000),
        output_token_price: Decimal.new("0.4536") |> Decimal.div(1_000_000)
      },
      {"https://api.mistral.ai/v1/chat/completions", "mistral-small"} => %{
        input_token_price: Decimal.new("0.648") |> Decimal.div(1_000_000),
        output_token_price: Decimal.new("1.944") |> Decimal.div(1_000_000)
      },
      {"https://api.mistral.ai/v1/chat/completions", "mistral-medium"} => %{
        input_token_price: Decimal.new("2.7") |> Decimal.div(1_000_000),
        output_token_price: Decimal.new("8.1") |> Decimal.div(1_000_000)
      },
      {"https://api.mistral.ai/v1/chat/completions", "mistral-tiny-latest"} => %{
        input_token_price: Decimal.new("0.25") |> Decimal.div(1_000_000),
        output_token_price: Decimal.new("0.25") |> Decimal.div(1_000_000)
      },
      {"https://api.mistral.ai/v1/chat/completions", "mistral-small-latest"} => %{
        input_token_price: Decimal.new("2") |> Decimal.div(1_000_000),
        output_token_price: Decimal.new("6") |> Decimal.div(1_000_000)
      },
      {"https://api.mistral.ai/v1/chat/completions", "mistral-medium-latest"} => %{
        input_token_price: Decimal.new("2.7") |> Decimal.div(1_000_000),
        output_token_price: Decimal.new("8.1") |> Decimal.div(1_000_000)
      },
      {"https://api.mistral.ai/v1/chat/completions", "mistral-large-latest"} => %{
        input_token_price: Decimal.new("8") |> Decimal.div(1_000_000),
        output_token_price: Decimal.new("24") |> Decimal.div(1_000_000)
      }
    }
    |> Map.get_lazy(api_model, fn ->
      Logger.warning("Model not found: #{endpoint} #{model}. Using empty prices.")

      %{
        input_token_price: 0,
        output_token_price: 0
      }
    end)
  end
end
