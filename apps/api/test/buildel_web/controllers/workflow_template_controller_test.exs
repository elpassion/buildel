defmodule BuildelWeb.WorkflowTemplateControllerTest do
  use BuildelWeb.ConnCase, async: true

  import Buildel.OrganizationsFixtures

  alias Buildel.Organizations

  setup %{conn: conn} do
    {:ok,
     conn:
       put_req_header(conn, "accept", "application/json")
       |> put_req_header("content-type", "application/json")}
  end

  setup [:register_and_log_in_user, :create_user_organization]

  describe "index" do
    test_requires_authentication %{conn: conn, organization: organization} do
      get(conn, ~p"/api/organizations/#{organization.id}/workflow_templates")
    end

    test "returns list of workflow templates", %{
      conn: conn,
      api_spec: api_spec,
      organization: organization
    } do
      conn = get(conn, ~p"/api/organizations/#{organization.id}/workflow_templates")

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

  describe "create" do
    test_requires_authentication %{conn: conn, organization: organization} do
      post(conn, ~p"/api/organizations/#{organization.id}/workflow_templates")
    end

    test "returns 404 when no template found for name", %{
      conn: conn,
      organization: organization
    } do
      conn =
        post(conn, ~p"/api/organizations/#{organization.id}/workflow_templates", %{
          template_name: "404notemplate"
        })

      assert json_response(conn, 404)
    end

    test "creates a pipeline from template", %{
      conn: conn,
      organization: organization,
      api_spec: api_spec
    } do
      conn =
        post(conn, ~p"/api/organizations/#{organization.id}/workflow_templates", %{
          template_name: "AI Chat"
        })

      response = json_response(conn, 200)

      assert %{"name" => "AI Chat"} == response["data"]

      assert_schema(response, "WorkflowTemplateShowResponse", api_spec)

      conn = get(conn, ~p"/api/organizations/#{organization.id}/pipelines")

      assert [%{"name" => "AI Chat"}] = json_response(conn, 200)["data"]
    end
  end

  defp create_user_organization(%{user: user}) do
    membership = membership_fixture(%{user_id: user.id})
    organization = membership |> Map.get(:organization_id) |> Organizations.get_organization!()
    %{organization: organization}
  end
end
