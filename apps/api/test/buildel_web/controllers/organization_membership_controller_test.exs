defmodule BuildelWeb.OrganizationMembershipControllerTest do
  use BuildelWeb.ConnCase, async: true
  import Buildel.OrganizationsFixtures
  alias Buildel.AccountsFixtures
  alias Buildel.Organizations

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  setup [:register_and_log_in_user, :create_user_organization]

  describe "index" do
    test "requires authentication", %{conn: conn, organization: organization} do
      conn = conn |> log_out_user()
      conn = get(conn, ~p"/api/organizations/#{organization.id}/memberships")
      assert json_response(conn, 401)["errors"] != %{}
    end

    test "lists all organization members", %{conn: conn, organization: organization, user: user} do
      conn = get(conn, ~p"/api/organizations/#{organization.id}/memberships")
      organization_id = organization.id
      user_email = user.email

      assert [
               %{"organization_id" => ^organization_id},
               %{"organization_id" => ^organization_id, "user" => %{"email" => ^user_email}}
             ] = json_response(conn, 200)["data"]
    end
  end

  describe "create" do
    test "requires authentication", %{conn: conn, organization: organization} do
      conn = conn |> log_out_user()
      %{user: another_user} = create_user(%{})

      conn =
        post(conn, ~p"/api/organizations/#{organization.id}/memberships",
          membership: %{user_email: another_user.email}
        )

      assert json_response(conn, 401)["errors"] != %{}
    end

    test "returns created membership", %{conn: conn, organization: organization} do
      %{user: another_user} = create_user(%{})
      organization_id = organization.id
      user_email = another_user.email

      conn =
        post(conn, ~p"/api/organizations/#{organization.id}/memberships",
          membership: %{user_email: another_user.email}
        )

      assert %{
               "id" => _id,
               "organization_id" => ^organization_id,
               "user" => %{"email" => ^user_email}
             } = json_response(conn, 201)["data"]
    end
  end

  defp create_user_organization(%{user: user}) do
    membership = membership_fixture(%{user_id: user.id})
    organization = membership |> Map.get(:organization_id) |> Organizations.get_organization!()
    %{organization: organization}
  end

  defp create_user(_) do
    user = AccountsFixtures.user_fixture()
    %{user: user}
  end
end
