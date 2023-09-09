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
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  setup [:register_and_log_in_user, :create_user_organization]

  describe "index" do
    test "requires authentication", %{conn: conn, organization: organization} do
      conn = conn |> log_out_user()
      organization_id = organization.id
      conn = get(conn, ~p"/api/organizations/#{organization_id}/pipelines")
      assert json_response(conn, 401)["errors"] != %{}
    end

    test "lists all organization pipelines", %{conn: conn, organization: organization} do
      organization_id = organization.id
      conn = get(conn, ~p"/api/organizations/#{organization_id}/pipelines")
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create pipeline" do
    test "requires authentication", %{conn: conn, organization: organization} do
      conn = conn |> log_out_user()

      conn =
        post(conn, ~p"/api/organizations/#{organization.id}/pipelines",
          pipeline: @create_attrs |> Enum.into(%{organization_id: organization.id})
        )

      assert json_response(conn, 401)["errors"] != %{}
    end

    test "renders pipeline when data is valid", %{conn: conn, organization: organization} do
      organization_id = organization.id

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

    test "renders errors when data is invalid", %{conn: conn, organization: organization} do
      organization_id = organization.id

      conn =
        post(conn, ~p"/api/organizations/#{organization_id}/pipelines", pipeline: @invalid_attrs)

      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update pipeline" do
    setup [:create_pipeline]

    test "requires authentication", %{conn: conn, pipeline: %Pipeline{id: _id} = pipeline} do
      conn = conn |> log_out_user()

      conn =
        put(conn, ~p"/api/organizations/#{pipeline.organization_id}/pipelines/#{pipeline}",
          pipeline: @update_attrs
        )

      assert json_response(conn, 401)["errors"] != %{}
    end

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

      assert_error_sent(404, fn ->
        get(conn, ~p"/api/organizations/#{pipeline.organization_id}/pipelines/#{pipeline.id}")
      end)
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
