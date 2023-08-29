defmodule BuildelWeb.RunControllerTest do
  use BuildelWeb.ConnCase

  import Buildel.PipelinesFixtures

  @invalid_attrs %{}

  setup %{conn: conn} do
    pipeline = pipeline_fixture()
    {:ok, conn: put_req_header(conn, "accept", "application/json"), pipeline: pipeline}
  end

  describe "index" do
    test "lists all runs", %{conn: conn} do
      conn = get(conn, ~p"/api/runs")
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "show" do
    test "renders 404 when run does not exist", %{conn: conn} do
      conn = get(conn, ~p"/api/runs/0")
      assert json_response(conn, 404)["errors"] != %{}
    end
  end

  describe "create run" do
    test "renders run when data is valid", %{conn: conn, pipeline: pipeline} do
      conn = post(conn, ~p"/api/runs", run: %{pipeline_id: pipeline.id})
      assert %{"id" => id} = json_response(conn, 201)["data"]
      pipeline_id = pipeline.id

      conn = get(conn, ~p"/api/runs/#{id}")

      assert %{
               "id" => ^id,
               "pipeline_id" => ^pipeline_id,
               "status" => "created"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, ~p"/api/runs", run: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "start run" do
    test "starts run", %{conn: conn, pipeline: pipeline} do
      conn = post(conn, ~p"/api/runs", run: %{pipeline_id: pipeline.id})
      assert %{"id" => id} = json_response(conn, 201)["data"]
      pipeline_id = pipeline.id

      conn = put(conn, ~p"/api/runs/#{id}/start")

      assert %{
               "id" => ^id,
               "pipeline_id" => ^pipeline_id,
               "status" => "running"
             } = json_response(conn, 200)["data"]
    end
  end

  describe "stop run" do
    test "stops run", %{conn: conn, pipeline: pipeline} do
      conn = post(conn, ~p"/api/runs", run: %{pipeline_id: pipeline.id})
      assert %{"id" => id} = json_response(conn, 201)["data"]
      pipeline_id = pipeline.id

      conn = put(conn, ~p"/api/runs/#{id}/start")
      conn = put(conn, ~p"/api/runs/#{id}/stop")

      assert %{
               "id" => ^id,
               "pipeline_id" => ^pipeline_id,
               "status" => "finished"
             } = json_response(conn, 200)["data"]
    end
  end
end
