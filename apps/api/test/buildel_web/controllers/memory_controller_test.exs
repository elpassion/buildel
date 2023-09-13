defmodule BuildelWeb.MemoryControllerTest do
  use BuildelWeb.ConnCase
  import Buildel.OrganizationsFixtures
  import Buildel.PipelinesFixtures

  alias Buildel.Pipelines.Pipeline
  alias Buildel.Organizations

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  setup [:register_and_log_in_user, :create_user_organization]

  describe "create" do
    test "requires authentication", %{conn: conn} do
      conn = conn |> log_out_user()

      file = %Plug.Upload{path: "test/support/fixtures/example.txt", filename: "example.txt"}
      files = [file]

      conn =
        post(conn, ~p"/api/memories", files: files)

      assert json_response(conn, 401)["errors"] != %{}
    end
  end

  defp create_pipeline(%{organization: organization}) do
    pipeline = pipeline_fixture(%{organization_id: organization.id})
    %{pipeline: pipeline}
  end

  defp create_user_organization(%{user: user}) do
    membership = membership_fixture(%{user_id: user.id})
    organization = membership |> Map.get(:organization_id) |> Organizations.get_organization!()
    %{organization: organization}
  end
end
