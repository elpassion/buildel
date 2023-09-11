defmodule BuildelWeb.PipelineSocketTest do
  alias Buildel.Organizations.Organization
  use BuildelWeb.ChannelCase

  import Buildel.OrganizationsFixtures

  describe "connect" do
    test "fails when trying to connect without correct params" do
      assert {:error,
              %{
                errors: %{api_key: ["can't be blank"], organization_id: ["can't be blank"]}
              }} =
               BuildelWeb.PipelineSocket |> connect(%{})
    end

    test "fails when trying to connect to non existant organization" do
      assert {:error, %{errors: %{detail: "Not Found"}}} =
               BuildelWeb.PipelineSocket
               |> connect(%{organization_id: 123, api_key: "api_key"})
    end

    test "fails when trying to connect to existant org with wrong key" do
      organization = organization_fixture()

      assert {:error, %{errors: %{detail: "Not Found"}}} =
               BuildelWeb.PipelineSocket
               |> connect(%{organization_id: organization.id, api_key: "wrong_key"})
    end

    test "connects with correct data" do
      organization = organization_fixture()
      organization_id = organization.id

      assert {:ok, %Phoenix.Socket{assigns: %{organization: %Organization{id: ^organization_id}}}} =
               BuildelWeb.PipelineSocket
               |> connect(%{
                 organization_id: organization.id,
                 api_key: organization.api_keys |> List.first() |> Map.get(:key)
               })
    end
  end
end
