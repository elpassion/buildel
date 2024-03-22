defmodule BuildelWeb.OrganizationPipelineControllerTest do
  use BuildelWeb.ConnCase
  import Buildel.OrganizationsFixtures
  import Buildel.PipelinesFixtures

  alias Buildel.Organizations

  setup %{conn: conn} do
    {:ok,
     conn:
       put_req_header(conn, "accept", "application/json")
       |> put_req_header("content-type", "application/json")}
  end

  setup [:register_and_log_in_user, :create_user_organization]

  describe "show" do
    setup [:create_pipeline, :create_public_pipeline]

    test_requires_authentication %{conn: conn, organization: organization, public_pipeline: pipeline} do
      get(conn, ~p"/api/organizations/#{organization}/pipelines/#{pipeline}/public")
    end

    test "Returns 404 when pipeline does not exist", %{
      conn: conn,
      organization: organization
    } do
      conn = get(conn, ~p"/api/organizations/#{organization.id}/pipelines/123123/public")

      assert json_response(conn, 404)
    end

    test "returns forbidden when pipeline is not public", %{
      conn: conn,
      organization: organization,
      pipeline: pipeline
    } do
      conn = get(conn, ~p"/api/organizations/#{organization}/pipelines/#{pipeline}/public")
      assert json_response(conn, 401)
    end

    test "Shows organization pipeline", %{
      conn: conn,
      organization: organization,
      public_pipeline: pipeline,
      api_spec: api_spec
    } do
      organization_id = organization.id
      conn = get(conn, ~p"/api/organizations/#{organization_id}/pipelines/#{pipeline.id}/public")
      response = json_response(conn, 200)
      assert response["data"] != %{}
      assert_schema(response, "PipelineShowResponse", api_spec)
    end
  end

  defp create_pipeline(%{organization: organization}) do
    pipeline = pipeline_fixture(%{organization_id: organization.id})
    %{pipeline: pipeline}
  end

  defp create_public_pipeline(%{organization: organization}) do
    pipeline = pipeline_fixture(%{organization_id: organization.id, interface_config: %{ "public" => true }})
    %{public_pipeline: pipeline}
  end

  defp create_user_organization(%{user: user}) do
    membership = membership_fixture(%{user_id: user.id})
    organization = membership |> Map.get(:organization_id) |> Organizations.get_organization!()
    %{organization: organization}
  end
end
