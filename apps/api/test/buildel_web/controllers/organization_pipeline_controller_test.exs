defmodule BuildelWeb.OrganizationPipelineControllerTest do
  use BuildelWeb.ConnCase
  import Buildel.OrganizationsFixtures
  import Buildel.PipelinesFixtures

  alias Buildel.Pipelines.Pipeline

  @create_attrs %{
    name: "some name",
    config: %{}
  }
  @update_attrs %{
    name: "some updated name",
    config: %{}
  }
  @invalid_attrs %{name: nil, config: nil}

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    test "lists all organization pipelines", %{conn: conn} do
      organization_id = organization_fixture().id
      conn = get(conn, ~p"/api/organizations/#{organization_id}/pipelines")
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create pipeline" do
    test "renders pipeline when data is valid", %{conn: conn} do
      organization_id = organization_fixture().id

      conn =
        post(conn, ~p"/api/organizations/#{organization_id}/pipelines",
          pipeline: @create_attrs |> Enum.into(%{organization_id: organization_id})
        )

      assert %{"id" => id} = json_response(conn, 201)["data"]

      conn = get(conn, ~p"/api/organizations/#{organization_id}/pipelines/#{id}")

      assert %{
               "id" => ^id,
               "config" => %{},
               "name" => "some name"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn} do
      organization_id = organization_fixture().id

      conn =
        post(conn, ~p"/api/organizations/#{organization_id}/pipelines", pipeline: @invalid_attrs)

      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update pipeline" do
    setup [:create_pipeline]

    test "renders pipeline when data is valid", %{
      conn: conn,
      pipeline: %Pipeline{id: id} = pipeline
    } do
      conn =
        put(conn, ~p"/api/organizations/#{pipeline.organization_id}/pipelines/#{pipeline}",
          pipeline: @update_attrs
        )

      assert %{"id" => ^id} = json_response(conn, 200)["data"]

      conn = get(conn, ~p"/api/organizations/#{pipeline.organization_id}/pipelines/#{id}")

      assert %{
               "id" => ^id,
               "config" => %{},
               "name" => "some updated name"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn, pipeline: pipeline} do
      conn =
        put(conn, ~p"/api/organizations/#{pipeline.organization_id}/pipelines/#{pipeline}",
          pipeline: @invalid_attrs
        )

      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete pipeline" do
    setup [:create_pipeline]

    test "deletes chosen pipeline", %{conn: conn, pipeline: pipeline} do
      conn =
        delete(conn, ~p"/api/organizations/#{pipeline.organization_id}/pipelines/#{pipeline.id}")

      assert response(conn, 204)

      assert_error_sent(404, fn ->
        get(conn, ~p"/api/organizations/#{pipeline.organization_id}/pipelines/#{pipeline.id}")
      end)
    end
  end

  defp create_pipeline(_) do
    pipeline = pipeline_fixture()
    %{pipeline: pipeline}
  end
end
