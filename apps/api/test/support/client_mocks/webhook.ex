defmodule Buildel.ClientMocks.Webhook do
  alias Buildel.Clients.WebhookBehaviour
  @behaviour WebhookBehaviour

  @impl WebhookBehaviour
  def send_content(pid, url, payload \\ nil) do
    send(pid, {:webhook_called, url})
  end
end
