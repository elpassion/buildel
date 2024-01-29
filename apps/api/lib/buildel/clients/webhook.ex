defmodule Buildel.Clients.WebhookBehaviour do
  @callback send_content(String.t(), map(), list()) :: :ok
end

defmodule Buildel.Clients.Webhook do
  alias Buildel.Clients.WebhookBehaviour
  @behaviour Buildel.Clients.WebhookBehaviour

  @impl WebhookBehaviour
  def send_content(url, payload, headers \\ []) do
    headers = [{"Accept", "application/json"}, {"Content-Type", "application/json"}] ++ headers

    with {:ok, response} <- HTTPoison.post(url, payload, headers) do
      Logger.debug("Webhook response: #{inspect(response)}")
    else
      {:error, %HTTPoison.Error{reason: _reason} = error} ->
        Logger.error("Webhook error: #{inspect(error)}")

      {:error, %HTTPoison.Response{status_code: _status_code} = error} ->
        Logger.error("Webhook error: #{inspect(error)}")
    end

    :ok
  end
end
