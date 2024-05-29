defmodule Buildel.Blocks.WebhookOutput do
  use Buildel.Blocks.Block

  # Config

  @impl true
  defdelegate cast(pid, chunk), to: __MODULE__, as: :send_text

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

  # Client

  def send_text(pid, {:text, _text} = text) do
    GenServer.cast(pid, {:send_text, text})
  end

  # Server

  @impl true
  def init(%{context_id: context_id, type: __MODULE__, opts: opts} = state) do
    subscribe_to_connections(context_id, state.connections)

    context =
      block_context().context_from_context_id(context_id)
      |> Map.put("metadata", opts.metadata)

    {:ok, state |> Map.put(:context, context) |> assign_stream_state}
  end

  @impl true
  def handle_cast({:send_text, {:text, content}}, state) do
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
        "#{state[:context] |> Jason.encode!()}::#{payload}"
      )

    webhook().send_content(url, payload,
      Authorization: "Bearer #{token}",
      "X-Buildel-Topic": topic,
      "X-Buildel-Context": state[:context] |> Jason.encode!()
    )

    state = state |> schedule_stream_stop()

    {:noreply, state}
  end

  @impl true
  def handle_info({_name, :text, text, _metadata}, state) do
    cast(self(), {:text, text})
    {:noreply, state}
  end

  defp webhook() do
    Application.fetch_env!(:buildel, :webhook)
  end
end
