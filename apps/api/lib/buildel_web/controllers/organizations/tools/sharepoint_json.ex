defmodule BuildelWeb.OrganizationToolSharepointJSON do
  def list_sites(%{sites: sites}) do
    %{data: for(site <- sites, do: site(site))}
  end

  def list_drives(%{drives: drives}) do
    %{data: for(drive <- drives, do: drive(drive))}
  end

  defp drive(drive) do
    %{
      id: drive["id"],
      name: drive["name"]
    }
  end

  defp site(site) do
    %{
      id: site["id"],
      name: site["displayName"]
    }
  end
end
