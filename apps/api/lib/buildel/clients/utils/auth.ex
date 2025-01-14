defmodule Buildel.Clients.Utils.Auth do
  alias Buildel.Clients.Utils.Context

  defmacro __using__(_opts) do
    quote do
      import Buildel.Clients.Utils.Auth, only: [create_run_auth_token: 2]
    end
  end

  def create_run_auth_token(context_id, string) do
    %{global: organization_id} = Context.context_from_context_id(context_id)

    with secret when is_binary(secret) <-
           Buildel.Organizations.get_organization!(organization_id).api_key do
      {:ok, :crypto.mac(:hmac, :sha256, secret, string) |> Base.encode64()}
    else
      _ -> {:error, :not_found}
    end
  end
end
