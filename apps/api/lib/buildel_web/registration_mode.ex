defmodule BuildelWeb.RegistrationMode do
  import Plug.Conn
  import Phoenix.Controller

  def registration_mode(conn, _opts) do
    case Application.fetch_env!(:buildel, :registration_disabled) do
      true ->
        conn
        |> put_status(:forbidden)
        |> json(%{"errors" => "Registration is disabled."})
        |> halt()

      false ->
        conn
    end
  end
end
