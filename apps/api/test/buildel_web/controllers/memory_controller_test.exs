defmodule BuildelWeb.MemoryControllerTest do
  use BuildelWeb.ConnCase
  import Buildel.OrganizationsFixtures
  import Buildel.PipelinesFixtures

  alias Buildel.Pipelines.Pipeline
  alias Buildel.Organizations

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  setup [:register_and_log_in_user, :create_user_organization, :create_pipeline, :read_file]

  describe "create" do
    test "requires authentication", %{conn: conn, organization: organization} do
      conn = conn |> log_out_user()

      file = %Plug.Upload{path: "test/support/fixtures/example.txt", filename: "example.txt"}
      files = [file]

      conn =
        post(conn, ~p"/api/organizations/#{organization.id}/memories", files: files)

      assert json_response(conn, 401)["errors"] != %{}
    end

    test "validates files are present", %{conn: conn, files: files, organization: organization} do
      conn =
        post(conn, ~p"/api/organizations/#{organization.id}/memories", %{})

      assert json_response(conn, 422)["errors"] != %{}
    end

    test "returns :created when valid", %{conn: conn, files: files, pipeline: pipeline, organization: organization} do
      conn =
        post(conn, ~p"/api/organizations/#{organization.id}/memories", %{ files: files, collection_name: "pipelines:#{pipeline.id}" })

      assert json_response(conn, 201) == %{}
    end

  end

  defp read_file(_) do
    %{ files: [%Plug.Upload{path: "test/support/fixtures/example.txt", filename: "example.txt"}] }
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
