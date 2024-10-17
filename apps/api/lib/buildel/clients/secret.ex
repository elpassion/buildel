defmodule Buildel.Clients.Secret do
  def secret_from_context(%{global: organization_id}, secret_name) do
    with %Buildel.Organizations.Organization{} = organization <-
           Buildel.Organizations.get_organization!(organization_id),
         {:ok, secret} <- Buildel.Organizations.get_organization_secret(organization, secret_name) do
      secret.value
    else
      _ -> nil
    end
  end
end
