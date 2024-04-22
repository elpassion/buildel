defmodule BuildelWeb.WorkflowTemplateControllerTest do
  use BuildelWeb.ConnCase, async: true

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    test "returns list of workflow templates", %{conn: conn, api_spec: api_spec} do
      conn = get(conn, ~p"/api/workflow_templates")

      response = json_response(conn, 200)

      assert [
               %{"name" => "AI Chat"},
               %{"name" => "Speech To Text"},
               %{"name" => "Text To Speech"},
               %{"name" => "Knowledge Search To Text"}
             ] == response["data"]

      assert_schema(response, "WorkflowTemplateIndexResponse", api_spec)
    end
  end
end
