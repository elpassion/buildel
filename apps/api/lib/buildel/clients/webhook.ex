defmodule Buildel.Clients.WebhookBehaviour do
  @callback send_content(String.t(), Map) :: :ok
end

defmodule Buildel.Clients.Webhook do
  alias Buildel.Clients.WebhookBehaviour
  @behaviour Buildel.Clients.WebhookBehaviour

  @impl WebhookBehaviour
  def send_content(url, payload \\ nil) do
    headers = [{"Accept", "application/json"}, {"Content-Type", "application/json"}]

    payload = Jason.encode!(payload)

    HTTPoison.post!(url, payload, headers)
    :ok
  end
end
