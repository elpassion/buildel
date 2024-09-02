defmodule BuildelWeb.SecretControllerTest do
  use BuildelWeb.ConnCase, async: true
  import Buildel.OrganizationsFixtures
  import Buildel.SecretsFixtures

  alias Buildel.Organizations

  setup %{conn: conn} do
    {:ok,
     conn:
       conn
       |> put_req_header("accept", "application/json")
       |> put_req_header("content-type", "application/json")}
  end

  setup [
    :register_and_log_in_user,
    :create_user_organization,
    :create_secret
  ]

  describe "index" do
    test_requires_authentication %{conn: conn, organization: organization} do
      get(conn, ~p"/api/organizations/#{organization}/secrets")
    end

    test "requires organization membership", %{
      conn: conn,
      another_organization: organization
    } do
      conn =
        get(conn, ~p"/api/organizations/#{organization}/secrets")

      assert json_response(conn, 404)
    end

    test "lists organization secrets", %{
      conn: conn,
      organization: organization,
      secret: %{name: secret_name},
      api_spec: api_spec
    } do
      # TODO: Do not use the secret name as the secret id
      conn =
        get(conn, ~p"/api/organizations/#{organization}/secrets")

      response = json_response(conn, 200)

      assert [%{"name" => ^secret_name, "id" => ^secret_name}] = response["data"]
      assert_schema(response, "SecretIndexResponse", api_spec)
    end
  end

  describe "show" do
    test_requires_authentication %{conn: conn, organization: organization} do
      get(conn, ~p"/api/organizations/#{organization}/secrets")
    end

    test "requires organization membership", %{
      conn: conn,
      another_organization: organization,
      secret: %{name: secret_name}
    } do
      conn =
        get(conn, ~p"/api/organizations/#{organization}/secrets/#{secret_name}")

      assert json_response(conn, 404)
    end

    test "returns 404 when secret does not exist", %{
      conn: conn,
      organization: organization
    } do
      conn =
        get(conn, ~p"/api/organizations/#{organization}/secrets/randomsecret")

      assert json_response(conn, 404)
    end

    test "returns organization secret", %{
      conn: conn,
      organization: organization,
      secret: %{name: secret_name},
      api_spec: api_spec
    } do
      # TODO: Do not use the secret name as the secret id
      conn =
        get(conn, ~p"/api/organizations/#{organization}/secrets/#{secret_name}")

      response = json_response(conn, 200)

      assert %{"name" => ^secret_name, "id" => ^secret_name} = response["data"]
      assert_schema(response, "SecretShowResponse", api_spec)
    end
  end

  describe "create" do
    test_requires_authentication %{conn: conn, organization: organization} do
      post(conn, ~p"/api/organizations/#{organization}/secrets", %{name: "name", value: "value"})
    end

    test "requires organization membership", %{conn: conn, another_organization: organization} do
      conn =
        post(conn, ~p"/api/organizations/#{organization}/secrets", %{name: "name", value: "value"})

      assert json_response(conn, 404)
    end

    test "validates input", %{conn: conn, organization: organization} do
      conn =
        post(conn, ~p"/api/organizations/#{organization}/secrets", %{})

      assert json_response(conn, 422)
    end

    test "validates secret name", %{conn: conn, organization: organization} do
      conn =
        post(conn, ~p"/api/organizations/#{organization}/secrets", %{
          name: "__name",
          value: "value"
        })

      assert json_response(conn, 422)
    end

    test "creates a secret", %{conn: conn, organization: organization, api_spec: api_spec} do
      conn =
        post(conn, ~p"/api/organizations/#{organization}/secrets", %{name: "name", value: "value"})

      response = json_response(conn, 201)

      assert_schema(response, "SecretShowResponse", api_spec)
    end

    test "overwrites alias", %{conn: conn, organization: organization} do
      res =
        get(conn, ~p"/api/organizations/#{organization}/secrets/aliases")

      %{"data" => aliases} = json_response(res, 200)

      alias = List.first(aliases)["id"]

      first_secret =
        post(conn, ~p"/api/organizations/#{organization}/secrets", %{
          name: "name",
          value: "value",
          alias: alias
        })

      first_response = json_response(first_secret, 201)

      %{"alias" => ^alias, "id" => id} = first_response["data"]

      second_secret =
        post(conn, ~p"/api/organizations/#{organization}/secrets", %{
          name: "name2",
          value: "value",
          alias: alias
        })

      second_response = json_response(second_secret, 201)

      %{"alias" => ^alias, "id" => id2} = second_response["data"]

      res1 =
        get(conn, ~p"/api/organizations/#{organization}/secrets/#{id}")

      res2 =
        get(conn, ~p"/api/organizations/#{organization}/secrets/#{id2}")

      %{"alias" => nil} = json_response(res1, 200)["data"]
      %{"alias" => ^alias} = json_response(res2, 200)["data"]
    end
  end

  describe "delete" do
    test_requires_authentication %{conn: conn, organization: organization, secret: secret} do
      delete(conn, ~p"/api/organizations/#{organization}/secrets/#{secret.name}")
    end

    test "requires organization membership", %{
      conn: conn,
      another_organization: organization,
      another_secret: secret
    } do
      conn =
        delete(conn, ~p"/api/organizations/#{organization}/secrets/#{secret.name}")

      assert json_response(conn, 404)
    end

    test "deletes a secret", %{conn: conn, organization: organization, secret: secret} do
      conn =
        delete(conn, ~p"/api/organizations/#{organization}/secrets/#{secret.name}")

      assert json_response(conn, 200)
    end
  end

  describe "update" do
    test_requires_authentication %{conn: conn, organization: organization, secret: secret} do
      put(conn, ~p"/api/organizations/#{organization}/secrets/#{secret.name}", %{value: "value"})
    end

    test "requires organization membership", %{
      conn: conn,
      another_organization: organization,
      another_secret: secret
    } do
      conn =
        put(conn, ~p"/api/organizations/#{organization}/secrets/#{secret.name}", %{value: "value"})

      assert json_response(conn, 404)
    end

    test "validates input", %{conn: conn, organization: organization, secret: secret} do
      conn =
        put(conn, ~p"/api/organizations/#{organization}/secrets/#{secret.name}", %{
          alias: "dupa123"
        })

      assert json_response(conn, 422)
    end

    test "updates a secret", %{conn: conn, organization: organization, secret: secret} do
      conn =
        put(conn, ~p"/api/organizations/#{organization}/secrets/#{secret.name}", %{value: "value"})

      assert json_response(conn, 200)
    end
  end

  defp create_secret(%{organization: organization, another_organization: another_organization}) do
    secret = secret_fixture(%{organization_id: organization.id})

    another_secret = secret_fixture(%{organization_id: another_organization.id})
    %{secret: secret, another_secret: another_secret}
  end

  defp create_user_organization(%{user: user}) do
    membership = membership_fixture(%{user_id: user.id})
    organization = membership |> Map.get(:organization_id) |> Organizations.get_organization!()
    another_organization = organization_fixture(%{name: "another_organization"})
    %{organization: organization, another_organization: another_organization}
  end
end
