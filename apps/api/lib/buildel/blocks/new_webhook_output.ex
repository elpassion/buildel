defmodule Buildel.Blocks.NewWebhookOutput do
  use Buildel.Blocks.NewBlock
  alias Buildel.Clients.Utils.Context
  alias Buildel.Clients.Utils.Auth

  defblock(:webhook_output,
    description:
      "This module is adept at forwarding text data to specified webhook URLs, facilitating seamless external integrations.",
    groups: ["inputs / outputs"]
  )

  definput(:input, schema: %{})

  defoption(
    :url,
    %{
      type: "string",
      title: "Webhook url",
      description: "URL to which the block will send data.",
    }
  )

  def setup(state) do
    context = Context.context_from_context_id(state.context.context_id) |> Map.put("metadata", state.block.opts.metadata)

    {:ok, state |> Map.put(:api_context, context)}
  end

  def handle_input(:input, %Message{} = message, state) do
    send_stream_start(state, :output, message)

    send_text(message.message, state)

    send_stream_stop(state, :output, message)

    {:ok, state}
  end

  defp send_text(content, state) do
    topic =
      Buildel.BlockPubSub.io_topic(
        state.context.context_id,
        state.block.name,
        "output"
      )

    payload = %{"content" => content} |> Jason.encode!()

    {:ok, token} = Auth.create_run_auth_token(
        state.context.context_id,
        "#{state[:api_context] |> Jason.encode!()}::#{payload}"
      )

    webhook().send_content(option(state, :url), payload,
      Authorization: "Bearer #{token}",
      "X-Buildel-Topic": topic,
      "X-Buildel-Context": state[:api_context] |> Jason.encode!()
    )
  end



  defp webhook() do
    Application.fetch_env!(:buildel, :webhook)
  end
end
