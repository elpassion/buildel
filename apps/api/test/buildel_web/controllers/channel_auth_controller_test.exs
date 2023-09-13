defmodule BuildelWeb.ChannelAuthControllerTest do
  use BuildelWeb.ConnCase
  import Buildel.OrganizationsFixtures
  alias Buildel.Organizations

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  setup [:register_and_log_in_user, :create_user_organization]

  describe "create" do
    test "validates required params", %{conn: conn} do
      conn = post(conn, ~p"/api/channel_auth", %{})
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  defp create_user_organization(%{user: user}) do
    membership = membership_fixture(%{user_id: user.id})
    organization = membership |> Map.get(:organization_id) |> Organizations.get_organization!()
    %{organization: organization}
  end
end
