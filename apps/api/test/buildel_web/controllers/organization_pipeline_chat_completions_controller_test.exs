defmodule BuildelWeb.OrganizationPipelineChatCompletionsControllerTest do
  use BuildelWeb.ConnCase
  import Buildel.OrganizationsFixtures
  import Buildel.PipelinesFixtures

  alias Buildel.Organizations

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  setup [
    :register_and_log_in_user,
    :create_user_organization,
    :create_pipeline,
    :create_run,
    :create_alias
  ]

  describe "create" do
    test "requires authentication", %{conn: conn, organization: organization, pipeline: pipeline} do
      conn = conn |> log_out_user()

      conn =
        post(conn, ~p"/api/organizations/#{organization}/pipelines/#{pipeline}/chat/completions")

      assert json_response(conn, 401)["errors"] != %{}
    end

    test "does not allow access to other organizations", %{
      conn: conn
    } do
      other_organization = organization_fixture()
      other_pipeline = pipeline_fixture(%{organization_id: other_organization.id})

      conn =
        post(
          conn,
          ~p"/api/organizations/#{other_organization}/pipelines/#{other_pipeline}/chat/completions"
        )

      assert json_response(conn, 404)
    end

    # test "creates run with latest alias by default", %{
    #   conn: conn,
    #   organization: organization,
    #   pipeline: pipeline
    # } do
    #   conn = post(conn, ~p"/api/organizations/#{organization}/pipelines/#{pipeline}/runs")
    #   blocks = pipeline.config["blocks"]

    #   assert %{
    #            "status" => "created",
    #            "config" => %{"metadata" => %{}, "blocks" => ^blocks}
    #          } = json_response(conn, 200)["data"]
    # end

    # test "saves metadata", %{
    #   conn: conn,
    #   organization: organization,
    #   pipeline: pipeline
    # } do
    #   conn =
    #     post(
    #       conn,
    #       ~p"/api/organizations/#{organization}/pipelines/#{pipeline}/runs",
    #       %{"metadata" => %{"key" => "value"}}
    #     )

    #   assert %{
    #            "status" => "created",
    #            "config" => %{"metadata" => %{"key" => "value"}}
    #          } = json_response(conn, 200)["data"]
    # end

    # test "creates run with specific alias", %{
    #   conn: conn,
    #   organization: organization,
    #   pipeline: pipeline,
    #   alias: %{config: config, id: id}
    # } do
    #   conn =
    #     post(
    #       conn,
    #       ~p"/api/organizations/#{organization}/pipelines/#{pipeline}/runs",
    #       %{"alias" => id}
    #     )

    #   blocks = config["blocks"]

    #   assert %{
    #            "status" => "created",
    #            "config" => %{"metadata" => %{}, "blocks" => ^blocks}
    #          } = json_response(conn, 200)["data"]
    # end
  end

  defp create_run(%{pipeline: pipeline}) do
    run = run_fixture(%{pipeline_id: pipeline.id})
    %{run: run}
  end

  defp create_pipeline(%{organization: organization}) do
    pipeline = pipeline_fixture(%{organization_id: organization.id})
    %{pipeline: pipeline}
  end

  defp create_alias(%{pipeline: pipeline}) do
    alias = alias_fixture(%{pipeline_id: pipeline.id})
    %{alias: alias}
  end

  defp create_user_organization(%{user: user}) do
    membership = membership_fixture(%{user_id: user.id})
    organization = membership |> Map.get(:organization_id) |> Organizations.get_organization!()
    %{organization: organization}
  end
end
