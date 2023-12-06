defmodule Buildel.ClientMocks.Webhook do
  alias Buildel.Clients.WebhookBehaviour
  @behaviour WebhookBehaviour

  @impl WebhookBehaviour
  def send_content(_url, _payload, _headers \\ nil) do
    :ok
  end
end
