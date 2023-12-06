defmodule Buildel.Clients.WebhookBehaviour do
  @callback send_content(String.t(), map(), list()) :: :ok
end

defmodule Buildel.Clients.Webhook do
  alias Buildel.Clients.WebhookBehaviour
  @behaviour Buildel.Clients.WebhookBehaviour

  @impl WebhookBehaviour
  def send_content(url, payload, headers \\ []) do
    headers = [{"Accept", "application/json"}, {"Content-Type", "application/json"}] ++ headers

    payload = Jason.encode!(payload)

    HTTPoison.post!(url, payload, headers)
    :ok
  end
end
