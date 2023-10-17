defmodule Buildel.BlockSecrets do
  def get_secret_from_context(context, secret_name) do
    with %{ global: organization_id } <- Buildel.Pipelines.Worker.context_from_context_id(context),
      %Buildel.Organizations.Organization{} = organization <- Buildel.Organizations.get_organization!(organization_id),
      {:ok, secret} <- Buildel.Organizations.get_organization_secret(organization, secret_name) do
      secret.value
    else
      _ -> nil
    end
  end
end