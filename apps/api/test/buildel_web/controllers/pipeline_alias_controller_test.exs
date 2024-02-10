defmodule BuildelWeb.OrganizationPipelineAliasControllerTest do
  use BuildelWeb.ConnCase
  import Buildel.OrganizationsFixtures
  import Buildel.PipelinesFixtures

  alias Buildel.Organizations
  alias Buildel.Pipelines.{Alias}

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  setup [
    :register_and_log_in_user,
    :create_user_organization,
    :create_pipeline,
    :create_pipeline_alias
  ]

  describe "index" do
    test "requires authentication", %{conn: conn, organization: organization, pipeline: pipeline} do
      conn = conn |> log_out_user()
      organization_id = organization.id
      pipeline_id = pipeline.id
      conn = get(conn, ~p"/api/organizations/#{organization_id}/pipelines/#{pipeline_id}/aliases")
      assert json_response(conn, 401)["errors"] != %{}
    end

    test "returns 404 when pipeline does not exist", %{conn: conn, organization: organization} do
      conn = get(conn, ~p"/api/organizations/#{organization.id}/pipelines/420/aliases")
      assert json_response(conn, 404)
    end

    test "lists all pipeline aliases including latest", %{
      conn: conn,
      organization: organization,
      pipeline: pipeline,
      alias: %{id: alias_id, name: alias_name, config: alias_config}
    } do
      organization_id = organization.id
      pipeline_id = pipeline.id

      %{config: pipeline_config, interface_config: pipeline_interface_config, name: pipeline_name} =
        pipeline

      conn = get(conn, ~p"/api/organizations/#{organization_id}/pipelines/#{pipeline_id}/aliases")

      assert [
               %{
                 "config" => ^pipeline_config,
                 "id" => "latest",
                 "interface_config" => ^pipeline_interface_config,
                 "name" => ^pipeline_name
               },
               %{
                 "config" => ^alias_config,
                 "id" => ^alias_id,
                 "interface_config" => %{},
                 "name" => ^alias_name
               }
             ] = json_response(conn, 200)["data"]
    end
  end

  describe "create alias" do
    test "requires authentication", %{conn: conn, organization: organization, pipeline: pipeline} do
      conn = conn |> log_out_user()

      conn =
        post(
          conn,
          ~p"/api/organizations/#{organization.id}/pipelines/#{pipeline.id}/aliases",
          %{}
        )

      assert json_response(conn, 401)["errors"] != %{}
    end

    test "renders alias when data is valid", %{
      conn: conn,
      organization: organization,
      pipeline: pipeline
    } do
      organization_id = organization.id

      conn =
        post(
          conn,
          ~p"/api/organizations/#{organization_id}/pipelines/#{pipeline.id}/aliases",
          %{
            "alias" => %{
              "name" => "some name",
              "config" => %{},
              "interface_config" => %{}
            }
          }
        )

      assert %{"id" => id} = json_response(conn, 201)["data"]

      conn =
        get(
          conn,
          ~p"/api/organizations/#{organization_id}/pipelines/#{pipeline.id}/aliases/#{id}"
        )

      assert %{
               "id" => ^id,
               "config" => %{},
               "name" => "some name"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{
      conn: conn,
      organization: organization,
      pipeline: pipeline
    } do
      organization_id = organization.id

      conn =
        post(
          conn,
          ~p"/api/organizations/#{organization_id}/pipelines/#{pipeline.id}/aliases",
          %{}
        )

      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update alias" do
    setup [:create_pipeline, :create_pipeline_alias]

    test "requires authentication", %{conn: conn, pipeline: pipeline, alias: alias} do
      conn = conn |> log_out_user()

      conn =
        put(
          conn,
          ~p"/api/organizations/#{pipeline.organization_id}/pipelines/#{pipeline}/aliases/#{alias}",
          alias: %{"name" => "some updated name"}
        )

      assert json_response(conn, 401)["errors"] != %{}
    end

    test "renders pipeline when data is valid", %{
      conn: conn,
      pipeline: pipeline,
      alias: %Alias{id: id} = alias
    } do
      conn =
        put(
          conn,
          ~p"/api/organizations/#{pipeline.organization_id}/pipelines/#{pipeline}/aliases/#{alias}",
          alias: %{"name" => "some updated name"}
        )

      assert %{"id" => ^id} = json_response(conn, 200)["data"]

      conn =
        get(
          conn,
          ~p"/api/organizations/#{pipeline.organization_id}/pipelines/#{pipeline}/aliases/#{id}"
        )

      assert %{
               "id" => ^id,
               "name" => "some updated name"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn, pipeline: pipeline, alias: alias} do
      conn =
        put(
          conn,
          ~p"/api/organizations/#{pipeline.organization_id}/pipelines/#{pipeline}/aliases/#{alias}",
          noway: %{"name" => ""}
        )

      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete alias" do
    setup [:create_pipeline, :create_pipeline_alias]

    test "requires authentication", %{conn: conn, pipeline: pipeline, alias: alias} do
      conn = conn |> log_out_user()

      conn =
        delete(
          conn,
          ~p"/api/organizations/#{pipeline.organization_id}/pipelines/#{pipeline}/aliases/#{alias}"
        )

      assert json_response(conn, 401)["errors"] != %{}
    end

    test "deletes chosen alias", %{conn: conn, pipeline: pipeline, alias: alias} do
      conn =
        delete(
          conn,
          ~p"/api/organizations/#{pipeline.organization_id}/pipelines/#{pipeline}/aliases/#{alias}"
        )

      assert response(conn, 200)

      conn =
        get(
          conn,
          ~p"/api/organizations/#{pipeline.organization_id}/pipelines/#{pipeline}/aliases/#{alias}"
        )

      assert json_response(conn, 404)["errors"] != %{}
    end
  end

  defp create_pipeline_alias(%{pipeline: pipeline}) do
    alias = alias_fixture(%{pipeline_id: pipeline.id})
    %{alias: alias}
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
