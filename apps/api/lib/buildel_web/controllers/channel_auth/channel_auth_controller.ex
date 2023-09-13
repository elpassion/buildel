defmodule BuildelWeb.ChannelAuthController do
  use BuildelWeb, :controller
  use BuildelWeb.Validator

  action_fallback BuildelWeb.FallbackController

  defparams :create do
    required(:channel_name, :string)
    required(:socket_id, :string)
  end

  def create(conn, params) do
    with {:ok, %{channel_name: channel_name, socket_id: socket_id}} <- validate( :create, params) do
      conn
      |> put_status(200)
      |> json(%{})
    end
  end
end
