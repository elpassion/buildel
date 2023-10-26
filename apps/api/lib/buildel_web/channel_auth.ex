defmodule BuildelWeb.ChannelAuth do
  def create_auth_token(socket_id, channel_name, user_json, secret \\ nil) do
    secret = if secret == nil, do: app_secret(), else: secret
    :crypto.mac(:hmac, :sha256, secret, "#{socket_id}::#{channel_name}::#{user_json}") |> Base.encode64()
  end

  def verify_auth_token(socket_id, channel_name, user_json, auth_token, secret \\ nil) do
    case auth_token == create_auth_token(socket_id, channel_name, user_json, secret) do
      true -> :ok
      false -> {:error, :failed_to_verify_token}
    end
  end

  defp app_secret do
    Application.fetch_env!(:buildel, :secret_key_base)
  end
end
