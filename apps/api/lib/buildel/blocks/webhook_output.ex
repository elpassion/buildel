defmodule Buildel.Blocks.WebhookOutput do
  use Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "webhook_output",
      description:
        "This module is adept at forwarding text data to specified webhook URLs, facilitating seamless external integrations.",
      groups: ["inputs / outputs"],
      inputs: [Block.text_input()],
      outputs: [],
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
            "required" => ["url"],
            "properties" => %{
              "url" => %{
                "type" => "string",
                "title" => "Webhook url",
                "description" => "URL to which the block will send data."
              }
            }
          })
      }
    }
  end

  # Server

  @impl true
  def setup(%{context_id: context_id, type: __MODULE__, opts: opts} = state) do
    context =
      block_context().context_from_context_id(context_id)
      |> Map.put("metadata", opts.metadata)

    {:ok, state |> Map.put(:api_context, context)}
  end

  defp send_text(content, state) do
    state = state |> send_stream_start()

    url = state |> get_in([:opts, :url])

    topic =
      Buildel.BlockPubSub.io_topic(
        state[:context_id],
        state[:block_name],
        "output"
      )

    payload = %{"content" => content} |> Jason.encode!()

    {:ok, token} =
      block_context().create_run_auth_token(
        state[:context_id],
        "#{state[:api_context] |> Jason.encode!()}::#{payload}"
      )

    webhook().send_content(url, payload,
      Authorization: "Bearer #{token}",
      "X-Buildel-Topic": topic,
      "X-Buildel-Context": state[:api_context] |> Jason.encode!()
    )

    state |> send_stream_stop()
  end

  @impl true
  def handle_input("input", {_name, :text, text, _metadata}, state) do
    send_text(text, state)
  end

  defp webhook() do
    Application.fetch_env!(:buildel, :webhook)
  end
end
