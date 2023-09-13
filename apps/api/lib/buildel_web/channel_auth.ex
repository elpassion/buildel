defmodule BuildelWeb.ChannelAuth do
  def create_auth_token(socket_id, channel_name, user_json) do
    :crypto.mac(:hmac, :sha256, secret(), "#{socket_id}::#{channel_name}::#{user_json}") |> Base.encode64()
  end

  def verify_auth_token(socket_id, channel_name, user_json, auth_token) do
    auth_token == create_auth_token(socket_id, channel_name, user_json)
  end

  defp secret do
    Application.fetch_env!(:buildel, :secret_key_base)
  end
end
