defmodule Buildel.Costs.CostCalculator do
  require Logger

  def calculate_embeddings_cost(
        %Buildel.Langchain.EmbeddingsTokenSummary{
          model: model,
          endpoint: endpoint
        } = summary
      ) do
    %{token_price: token_price} =
      embeddings_prices({endpoint, model})

    Decimal.mult(token_price, summary.tokens)
  end

  def calculate_chat_cost(
        %Buildel.Langchain.ChatTokenSummary{model: model, endpoint: endpoint} = chat_token_summary
      ) do
    %{input_token_price: input_token_price, output_token_price: output_token_price} =
      prices({endpoint, model})

    input_tokens_cost = Decimal.mult(input_token_price, chat_token_summary.input_tokens)
    output_tokens_cost = Decimal.mult(output_token_price, chat_token_summary.output_tokens)

    Decimal.add(input_tokens_cost, output_tokens_cost)
  end

  defp embeddings_prices({endpoint, model} = api_model) do
    %{
      {"https://api.openai.com/v1/embeddings", "text-embedding-ada-002"} => %{
        token_price: Decimal.new("0.0001") |> Decimal.div(1000)
      },
      {"https://api.openai.com/v1/embeddings", "text-embedding-3-small"} => %{
        token_price: Decimal.new("0.00002") |> Decimal.div(1000)
      },
      {"https://api.openai.com/v1/embeddings", "text-embedding-3-large"} => %{
        token_price: Decimal.new("0.00013") |> Decimal.div(1000)
      },
      {"https://api.mistral.ai/v1/embeddings", "mistral-embed"} => %{
        token_price: Decimal.new("0.0001") |> Decimal.div(1000)
      }
    }
    |> Map.get_lazy(api_model, fn ->
      Logger.warning("Model not found: #{endpoint} #{model}. Using empty prices.")

      %{
        token_price: Decimal.new(0)
      }
    end)
  end

  defp prices({endpoint, model} = api_model) do
    %{
      {"https://api.openai.com/v1", "gpt-3.5-turbo"} => %{
        input_token_price: Decimal.new("0.0005") |> Decimal.div(1000),
        output_token_price: Decimal.new("0.0015") |> Decimal.div(1000)
      },
      {"https://api.openai.com/v1", "gpt-3.5-turbo-1106"} => %{
        input_token_price: Decimal.new("0.0010") |> Decimal.div(1000),
        output_token_price: Decimal.new("0.0020") |> Decimal.div(1000)
      },
      {"https://api.openai.com/v1", "gpt-3.5-turbo-0125"} => %{
        input_token_price: Decimal.new("0.0005") |> Decimal.div(1000),
        output_token_price: Decimal.new("0.0015") |> Decimal.div(1000)
      },
      {"https://api.openai.com/v1", "gpt-4"} => %{
        input_token_price: Decimal.new("0.03") |> Decimal.div(1000),
        output_token_price: Decimal.new("0.06") |> Decimal.div(1000)
      },
      {"https://api.openai.com/v1", "gpt-4-32k"} => %{
        input_token_price: Decimal.new("0.06") |> Decimal.div(1000),
        output_token_price: Decimal.new("0.12") |> Decimal.div(1000)
      },
      {"https://api.openai.com/v1", "gpt-4-1106-preview"} => %{
        input_token_price: Decimal.new("0.01") |> Decimal.div(1000),
        output_token_price: Decimal.new("0.03") |> Decimal.div(1000)
      },
      {"https://api.openai.com/v1", "gpt-4-turbo-preview"} => %{
        input_token_price: Decimal.new("0.01") |> Decimal.div(1000),
        output_token_price: Decimal.new("0.03") |> Decimal.div(1000)
      },
      {"https://api.openai.com/v1", "gpt-4-turbo"} => %{
        input_token_price: Decimal.new("0.01") |> Decimal.div(1000),
        output_token_price: Decimal.new("0.03") |> Decimal.div(1000)
      },
      {"https://api.openai.com/v1", "gpt-4o"} => %{
        input_token_price: Decimal.new("0.005") |> Decimal.div(1000),
        output_token_price: Decimal.new("0.015") |> Decimal.div(1000)
      },
      {"https://api.openai.com/v1", "gpt-4o-mini"} => %{
        input_token_price: Decimal.new("0.00015") |> Decimal.div(1000),
        output_token_price: Decimal.new("0.0006") |> Decimal.div(1000)
      },
      {"https://api.openai.com/v1", "gpt-4o-2024-08-06"} => %{
        input_token_price: Decimal.new("0.00250") |> Decimal.div(1000),
        output_token_price: Decimal.new("0.01000") |> Decimal.div(1000)
      },
      {"https://api.mistral.ai/v1", "mistral-tiny"} => %{
        input_token_price: Decimal.new("0.1512") |> Decimal.div(1_000_000),
        output_token_price: Decimal.new("0.4536") |> Decimal.div(1_000_000)
      },
      {"https://api.mistral.ai/v1", "mistral-small"} => %{
        input_token_price: Decimal.new("0.648") |> Decimal.div(1_000_000),
        output_token_price: Decimal.new("1.944") |> Decimal.div(1_000_000)
      },
      {"https://api.mistral.ai/v1", "mistral-medium"} => %{
        input_token_price: Decimal.new("2.7") |> Decimal.div(1_000_000),
        output_token_price: Decimal.new("8.1") |> Decimal.div(1_000_000)
      },
      {"https://api.mistral.ai/v1", "mistral-tiny-latest"} => %{
        input_token_price: Decimal.new("0.25") |> Decimal.div(1_000_000),
        output_token_price: Decimal.new("0.25") |> Decimal.div(1_000_000)
      },
      {"https://api.mistral.ai/v1", "mistral-small-latest"} => %{
        input_token_price: Decimal.new("2") |> Decimal.div(1_000_000),
        output_token_price: Decimal.new("6") |> Decimal.div(1_000_000)
      },
      {"https://api.mistral.ai/v1", "mistral-medium-latest"} => %{
        input_token_price: Decimal.new("2.7") |> Decimal.div(1_000_000),
        output_token_price: Decimal.new("8.1") |> Decimal.div(1_000_000)
      },
      {"https://api.mistral.ai/v1", "mistral-large-latest"} => %{
        input_token_price: Decimal.new("8") |> Decimal.div(1_000_000),
        output_token_price: Decimal.new("24") |> Decimal.div(1_000_000)
      },
      {"https://api.anthropic.com/v1", "claude-3-5-sonnet-20240620"} => %{
        input_token_price: Decimal.new("0.003") |> Decimal.div(1000),
        output_token_price: Decimal.new("0.015") |> Decimal.div(1000)
      },
      {"https://api.anthropic.com/v1", "claude-3-haiku-20240307"} => %{
        input_token_price: Decimal.new("0.00025") |> Decimal.div(1000),
        output_token_price: Decimal.new("0.00125") |> Decimal.div(1000)
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
