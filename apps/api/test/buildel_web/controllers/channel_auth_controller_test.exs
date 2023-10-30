defmodule BuildelWeb.ChannelAuthControllerTest do
  use BuildelWeb.ConnCase
  import Buildel.OrganizationsFixtures
  import Buildel.PipelinesFixtures
  alias Buildel.Organizations

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  setup [:register_and_log_in_user, :create_user_organization]

  describe "create" do
    test "fails for unauthenticated user", %{conn: conn} do
      conn =
        conn
        |> log_out_user()
        |> post(~p"/api/channel_auth", %{channel_name: "pipelines:1:1", socket_id: "1"})

      assert json_response(conn, 401)["errors"] != %{}
    end

    test "validates required params", %{conn: conn} do
      conn = post(conn, ~p"/api/channel_auth", %{})
      assert json_response(conn, 422)["errors"] != %{}
    end

    test "fails to authenticate for other orgs pipeline channel", %{conn: conn} do
      conn = post(conn, ~p"/api/channel_auth", %{channel_name: "pipelines:1:1", socket_id: "1"})
      assert json_response(conn, 401)["errors"] != %{}
    end

    test "authenticates if pipeline exists in org", %{conn: conn, organization: organization} do
      pipeline = pipeline_fixture(%{organization_id: organization.id})
      channel_name = "pipelines:#{organization.id}:#{pipeline.id}"
      socket_id = "1"

      conn =
        post(conn, ~p"/api/channel_auth", %{channel_name: channel_name, socket_id: socket_id})

      assert %{"user_data" => user_data, "auth" => auth} = json_response(conn, 200)

      assert :ok ==
               BuildelWeb.ChannelAuth.verify_auth_token(
                 socket_id,
                 channel_name,
                 user_data,
                 auth,
                 organization.api_key
               )
    end
  end

  defp create_user_organization(%{user: user}) do
    membership = membership_fixture(%{user_id: user.id})
    organization = membership |> Map.get(:organization_id) |> Organizations.get_organization!()
    %{organization: organization}
  end
end
