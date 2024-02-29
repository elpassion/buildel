defmodule BuildelWeb.OrganizationPipelineControllerTest do
  use BuildelWeb.ConnCase
  import Buildel.OrganizationsFixtures
  import Buildel.PipelinesFixtures

  alias Buildel.Pipelines.Pipeline
  alias Buildel.Organizations

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
    {:ok,
     conn:
       put_req_header(conn, "accept", "application/json")
       |> put_req_header("content-type", "application/json")}
  end

  setup [:register_and_log_in_user, :create_user_organization]

  describe "index" do
    test_requires_authentication %{conn: conn, organization: organization} do
      get(conn, ~p"/api/organizations/#{organization.id}/pipelines")
    end

    test "requires organization membership", %{conn: conn} do
      another_organization = organization_fixture()
      conn = get(conn, ~p"/api/organizations/#{another_organization.id}/pipelines")
      assert json_response(conn, 404)
    end

    test "empty list if no pipelines", %{conn: conn, organization: organization} do
      organization_id = organization.id
      conn = get(conn, ~p"/api/organizations/#{organization_id}/pipelines")
      assert json_response(conn, 200)["data"] == []
    end

    test "lists all organization pipelines", %{
      conn: conn,
      organization: organization,
      api_spec: api_spec
    } do
      organization_id = organization.id
      pipeline_fixture(%{organization_id: organization_id})
      conn = get(conn, ~p"/api/organizations/#{organization_id}/pipelines")
      response = json_response(conn, 200)
      assert_schema(response, "PipelineIndexResponse", api_spec)
    end
  end

  describe "show" do
    setup [:create_pipeline]

    test_requires_authentication %{conn: conn, organization: organization, pipeline: pipeline} do
      get(conn, ~p"/api/organizations/#{organization.id}/pipelines/#{pipeline.id}")
    end

    test "Returns 404 when pipeline does not exist", %{
      conn: conn,
      organization: organization
    } do
      conn = get(conn, ~p"/api/organizations/#{organization.id}/pipelines/123123")

      assert json_response(conn, 404)
    end

    test "Shows organization pipeline", %{
      conn: conn,
      organization: organization,
      pipeline: pipeline,
      api_spec: api_spec
    } do
      organization_id = organization.id
      conn = get(conn, ~p"/api/organizations/#{organization_id}/pipelines/#{pipeline.id}")
      response = json_response(conn, 200)
      assert response["data"] != %{}
      assert_schema(response, "PipelineShowResponse", api_spec)
    end
  end

  describe "create pipeline" do
    test_requires_authentication %{conn: conn, organization: organization} do
      post(conn, ~p"/api/organizations/#{organization.id}/pipelines", pipeline: @create_attrs)
    end

    test "renders pipeline when data is valid", %{
      conn: conn,
      organization: organization,
      api_spec: api_spec
    } do
      organization_id = organization.id

      conn =
        post(conn, ~p"/api/organizations/#{organization_id}/pipelines", pipeline: @create_attrs)

      response = json_response(conn, 201)
      assert %{"id" => id} = response["data"]
      assert_schema(response, "PipelineShowResponse", api_spec)

      conn = get(conn, ~p"/api/organizations/#{organization_id}/pipelines/#{id}")

      assert %{
               "id" => ^id,
               "config" => %{},
               "name" => "some name",
               "runs_count" => 0
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn, organization: organization} do
      organization_id = organization.id

      conn =
        post(conn, ~p"/api/organizations/#{organization_id}/pipelines", pipeline: @invalid_attrs)

      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update pipeline" do
    setup [:create_pipeline]

    test_requires_authentication %{conn: conn, pipeline: %Pipeline{id: _id} = pipeline} do
      put(conn, ~p"/api/organizations/#{pipeline.organization_id}/pipelines/#{pipeline}",
        pipeline: @update_attrs
      )
    end

    test "renders pipeline when data is valid", %{
      conn: conn,
      pipeline: %Pipeline{id: id} = pipeline,
      api_spec: api_spec
    } do
      conn =
        put(conn, ~p"/api/organizations/#{pipeline.organization_id}/pipelines/#{pipeline}",
          pipeline: @update_attrs
        )

      response = json_response(conn, 200)

      assert %{"id" => ^id} = response["data"]
      assert_schema(response, "PipelineShowResponse", api_spec)

      conn = get(conn, ~p"/api/organizations/#{pipeline.organization_id}/pipelines/#{id}")

      assert %{
               "id" => ^id,
               "config" => %{},
               "name" => "some updated name",
               "runs_count" => 0
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

    test "requires authentication", %{conn: conn, pipeline: %Pipeline{id: id} = pipeline} do
      conn = conn |> log_out_user()

      conn =
        delete(conn, ~p"/api/organizations/#{pipeline.organization_id}/pipelines/#{id}")

      assert json_response(conn, 401)["errors"] != %{}
    end

    test "deletes chosen pipeline", %{conn: conn, pipeline: pipeline} do
      conn =
        delete(conn, ~p"/api/organizations/#{pipeline.organization_id}/pipelines/#{pipeline.id}")

      assert response(conn, 204)

      conn =
        get(conn, ~p"/api/organizations/#{pipeline.organization_id}/pipelines/#{pipeline.id}")

      assert json_response(conn, 404)["errors"] != %{}
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
