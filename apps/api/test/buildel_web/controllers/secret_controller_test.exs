defmodule BuildelWeb.SecretControllerTest do
  use BuildelWeb.ConnCase
  import Buildel.OrganizationsFixtures
  import Buildel.SecretsFixtures

  alias Buildel.Organizations

  setup %{conn: conn} do
    {:ok,
     conn:
       conn
       |> put_req_header("accept", "application/json")}
  end

  setup [
    :register_and_log_in_user,
    :create_user_organization,
    :create_secret
  ]

  describe "index" do
    test "requires authentication", %{conn: conn, organization: organization} do
      conn = conn |> log_out_user()

      conn =
        get(conn, ~p"/api/organizations/#{organization}/secrets")

      assert json_response(conn, 401)
    end

    test "requires organization membership", %{conn: conn, another_organization: organization} do
      conn =
        get(conn, ~p"/api/organizations/#{organization}/secrets")

      assert json_response(conn, 404)
    end

    test "lists organization secrets", %{
      conn: conn,
      organization: organization,
      secret: %{name: secret_name}
    } do
      # TODO: Do not use the secret name as the secret id
      conn =
        get(conn, ~p"/api/organizations/#{organization}/secrets")

      assert [%{"name" => ^secret_name, "id" => ^secret_name}] = json_response(conn, 200)["data"]
    end
  end

  defp create_secret(%{organization: organization}) do
    secret = secret_fixture(%{organization_id: organization.id})
    %{secret: secret}
  end

  defp create_user_organization(%{user: user}) do
    membership = membership_fixture(%{user_id: user.id})
    organization = membership |> Map.get(:organization_id) |> Organizations.get_organization!()
    another_organization = organization_fixture(%{name: "another_organization"})
    %{organization: organization, another_organization: another_organization}
  end
end
