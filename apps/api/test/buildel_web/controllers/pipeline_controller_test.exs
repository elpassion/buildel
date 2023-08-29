defmodule BuildelWeb.PipelineControllerTest do
  use BuildelWeb.ConnCase

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
    test "lists all pipelines", %{conn: conn} do
      conn = get(conn, ~p"/api/pipelines")
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create pipeline" do
    test "renders pipeline when data is valid", %{conn: conn} do
      conn = post(conn, ~p"/api/pipelines", pipeline: @create_attrs)
      assert %{"id" => id} = json_response(conn, 201)["data"]

      conn = get(conn, ~p"/api/pipelines/#{id}")

      assert %{
               "id" => ^id,
               "config" => %{},
               "name" => "some name"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, ~p"/api/pipelines", pipeline: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update pipeline" do
    setup [:create_pipeline]

    test "renders pipeline when data is valid", %{conn: conn, pipeline: %Pipeline{id: id} = pipeline} do
      conn = put(conn, ~p"/api/pipelines/#{pipeline}", pipeline: @update_attrs)
      assert %{"id" => ^id} = json_response(conn, 200)["data"]

      conn = get(conn, ~p"/api/pipelines/#{id}")

      assert %{
               "id" => ^id,
               "config" => %{},
               "name" => "some updated name"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn, pipeline: pipeline} do
      conn = put(conn, ~p"/api/pipelines/#{pipeline}", pipeline: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete pipeline" do
    setup [:create_pipeline]

    test "deletes chosen pipeline", %{conn: conn, pipeline: pipeline} do
      conn = delete(conn, ~p"/api/pipelines/#{pipeline}")
      assert response(conn, 204)

      assert_error_sent 404, fn ->
        get(conn, ~p"/api/pipelines/#{pipeline}")
      end
    end
  end

  defp create_pipeline(_) do
    pipeline = pipeline_fixture()
    %{pipeline: pipeline}
  end
end
