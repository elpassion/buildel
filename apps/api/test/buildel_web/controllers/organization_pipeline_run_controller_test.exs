defmodule BuildelWeb.OrganizationPipelineRunControllerTest do
  use BuildelWeb.ConnCase
  import Buildel.OrganizationsFixtures
  import Buildel.PipelinesFixtures
  import Buildel.CostsFixtures

  alias Buildel.Pipelines
  alias Buildel.Organizations

  setup %{conn: conn} do
    {:ok,
     conn:
       put_req_header(conn, "accept", "application/json")
       |> put_req_header("content-type", "application/json")}
  end

  setup [
    :register_and_log_in_user,
    :create_user_organization,
    :create_pipeline,
    :create_run,
    :create_alias
  ]

  describe "index" do
    test_requires_authentication %{conn: conn, organization: organization, pipeline: pipeline} do
      get(conn, ~p"/api/organizations/#{organization}/pipelines/#{pipeline}/runs")
    end

    test "does not allow access to other organizations", %{
      conn: conn,
      pipeline: pipeline
    } do
      other_organization = organization_fixture()

      conn =
        get(conn, ~p"/api/organizations/#{other_organization.id}/pipelines/#{pipeline.id}/runs")

      assert json_response(conn, 404)
    end

    test "lists all organization pipeline runs", %{
      conn: conn,
      organization: organization,
      pipeline: pipeline,
      api_spec: api_spec
    } do
      conn = get(conn, ~p"/api/organizations/#{organization.id}/pipelines/#{pipeline.id}/runs")

      response = json_response(conn, 200)
      assert [_] = response["data"]

      assert_schema(response, "RunIndexResponse", api_spec)
    end
  end

  describe "show" do
    test_requires_authentication %{
      conn: conn,
      organization: organization,
      pipeline: pipeline,
      run: run
    } do
      get(conn, ~p"/api/organizations/#{organization}/pipelines/#{pipeline}/runs/#{run}")
    end

    test_not_found %{
      conn: conn,
      organization: organization,
      pipeline: pipeline
    } do
      get(conn, ~p"/api/organizations/#{organization}/pipelines/#{pipeline}/runs/123")
    end

    test "does not allow access to other organizations", %{
      conn: conn
    } do
      another_organization = organization_fixture()
      another_pipeline = pipeline_fixture(%{organization_id: another_organization.id})
      another_run = run_fixture(%{pipeline_id: another_pipeline.id})

      conn =
        get(
          conn,
          ~p"/api/organizations/#{another_organization}/pipelines/#{another_pipeline}/runs/#{another_run}"
        )

      assert json_response(conn, 404)
    end

    test "shows a specific organization pipeline run", %{
      conn: conn,
      organization: organization,
      pipeline: pipeline,
      run: run,
      api_spec: api_spec
    } do
      conn = get(conn, ~p"/api/organizations/#{organization}/pipelines/#{pipeline}/runs/#{run}")
      response = json_response(conn, 200)
      assert response["data"]["id"] == run.id
      assert_schema(response, "RunShowResponse", api_spec)
    end
  end

  describe "create" do
    test_requires_authentication %{conn: conn, organization: organization, pipeline: pipeline} do
      post(conn, ~p"/api/organizations/#{organization}/pipelines/#{pipeline}/runs")
    end

    test "does not allow access to other organizations", %{
      conn: conn
    } do
      other_organization = organization_fixture()
      other_pipeline = pipeline_fixture(%{organization_id: other_organization.id})

      conn =
        post(conn, ~p"/api/organizations/#{other_organization}/pipelines/#{other_pipeline}/runs")

      assert json_response(conn, 404)
    end

    test "creates run with latest alias by default", %{
      conn: conn,
      organization: organization,
      pipeline: pipeline,
      api_spec: api_spec
    } do
      conn = post(conn, ~p"/api/organizations/#{organization}/pipelines/#{pipeline}/runs")
      blocks = pipeline.config["blocks"]

      response = json_response(conn, 200)

      assert %{
               "status" => "created",
               "config" => %{"metadata" => %{}, "blocks" => ^blocks}
             } = response["data"]

      assert_schema(response, "RunShowResponse", api_spec)
    end

    test "saves metadata", %{
      conn: conn,
      organization: organization,
      pipeline: pipeline,
      api_spec: api_spec
    } do
      conn =
        post(
          conn,
          ~p"/api/organizations/#{organization}/pipelines/#{pipeline}/runs",
          %{"metadata" => %{"key" => "value"}}
        )

      response = json_response(conn, 200)

      assert %{
               "status" => "created",
               "config" => %{"metadata" => %{"key" => "value"}}
             } = response["data"]

      assert_schema(response, "RunShowResponse", api_spec)
    end

    test "creates run with specific alias", %{
      conn: conn,
      organization: organization,
      pipeline: pipeline,
      alias: %{config: config, id: id},
      api_spec: api_spec
    } do
      conn =
        post(
          conn,
          ~p"/api/organizations/#{organization}/pipelines/#{pipeline}/runs",
          %{"alias" => id}
        )

      blocks = config["blocks"]

      response = json_response(conn, 200)

      assert %{
               "status" => "created",
               "config" => %{"metadata" => %{}, "blocks" => ^blocks}
             } = response["data"]

      assert_schema(response, "RunShowResponse", api_spec)
    end
  end

  describe "start" do
    test_requires_authentication %{
      conn: conn,
      organization: organization,
      pipeline: pipeline,
      run: run
    } do
      post(conn, ~p"/api/organizations/#{organization}/pipelines/#{pipeline}/runs/#{run}/start")
    end

    test "does not allow access to other organizations", %{
      conn: conn
    } do
      another_organization = organization_fixture()
      another_pipeline = pipeline_fixture(%{organization_id: another_organization.id})
      another_run = run_fixture(%{pipeline_id: another_pipeline.id})

      conn =
        post(
          conn,
          ~p"/api/organizations/#{another_organization}/pipelines/#{another_pipeline}/runs/#{another_run}/start"
        )

      assert json_response(conn, 404)
    end

    test "starts a specific organization pipeline run", %{
      conn: conn,
      organization: organization,
      pipeline: pipeline,
      run: run,
      api_spec: api_spec
    } do
      conn =
        post(conn, ~p"/api/organizations/#{organization}/pipelines/#{pipeline}/runs/#{run}/start")

      response = json_response(conn, 200)
      assert response["data"]["status"] == "running"
      assert_schema(response, "RunShowResponse", api_spec)
    end

    test "allows to start a run if budget is not set", %{
      conn: conn,
      organization: organization,
      pipeline: pipeline,
      run: run,
      api_spec: api_spec
    } do
      create_cost(%{organization: organization, run: run})

      conn =
        post(conn, ~p"/api/organizations/#{organization}/pipelines/#{pipeline}/runs/#{run}/start")

      response = json_response(conn, 200)
      assert response["data"]["status"] == "running"
      assert_schema(response, "RunShowResponse", api_spec)
    end

    test "allows to start a run if budget is not exceeded", %{
      conn: conn,
      organization: organization,
      pipeline: pipeline,
      run: run,
      api_spec: api_spec
    } do
      Buildel.Pipelines.update_pipeline(pipeline, %{budget_limit: 110})

      create_cost(%{organization: organization, run: run})

      conn =
        post(conn, ~p"/api/organizations/#{organization}/pipelines/#{pipeline}/runs/#{run}/start")

      response = json_response(conn, 200)
      assert response["data"]["status"] == "running"
      assert_schema(response, "RunShowResponse", api_spec)
    end

    test "does not allow to start a run if budget is exceeded", %{
      conn: conn,
      organization: organization,
      pipeline: pipeline,
      run: run,
      api_spec: api_spec
    } do
      Buildel.Pipelines.update_pipeline(pipeline, %{budget_limit: 90})

      create_cost(%{organization: organization, run: run})

      conn =
        post(conn, ~p"/api/organizations/#{organization}/pipelines/#{pipeline}/runs/#{run}/start")

      res = json_response(conn, 400)
      assert_schema(res, "BudgetLimitExceededResponse", api_spec)
    end
  end

  describe "stop" do
    test_requires_authentication %{
      conn: conn,
      organization: organization,
      pipeline: pipeline,
      run: run
    } do
      post(conn, ~p"/api/organizations/#{organization}/pipelines/#{pipeline}/runs/#{run}/stop")
    end

    test "does not allow access to other organizations", %{
      conn: conn
    } do
      another_organization = organization_fixture()
      another_pipeline = pipeline_fixture(%{organization_id: another_organization.id})
      another_run = run_fixture(%{pipeline_id: another_pipeline.id})

      conn =
        post(
          conn,
          ~p"/api/organizations/#{another_organization}/pipelines/#{another_pipeline}/runs/#{another_run}/stop"
        )

      assert json_response(conn, 404)
    end

    test "stops a specific organization pipeline run", %{
      conn: conn,
      organization: organization,
      pipeline: pipeline,
      run: run,
      api_spec: api_spec
    } do
      conn =
        post(conn, ~p"/api/organizations/#{organization}/pipelines/#{pipeline}/runs/#{run}/stop")

      response = json_response(conn, 200)
      assert response["data"]["status"] == "finished"
      assert_schema(response, "RunShowResponse", api_spec)
    end
  end

  describe "input" do
    test_requires_authentication %{
      conn: conn,
      organization: organization,
      pipeline: pipeline,
      run: run
    } do
      post(
        conn,
        ~p"/api/organizations/#{organization}/pipelines/#{pipeline}/runs/#{run}/input",
        %{
          "block_name" => "block",
          "input_name" => "input",
          "data" => "data"
        }
      )
    end

    test "does not allow access to other organizations", %{
      conn: conn
    } do
      another_organization = organization_fixture()
      another_pipeline = pipeline_fixture(%{organization_id: another_organization.id})
      another_run = run_fixture(%{pipeline_id: another_pipeline.id})

      conn =
        post(
          conn,
          ~p"/api/organizations/#{another_organization}/pipelines/#{another_pipeline}/runs/#{another_run}/input",
          %{
            "block_name" => "block",
            "input_name" => "input",
            "data" => "data"
          }
        )

      assert json_response(conn, 404)
    end

    test "validates input", %{
      conn: conn,
      organization: organization,
      pipeline: pipeline,
      run: run
    } do
      conn =
        post(
          conn,
          ~p"/api/organizations/#{organization}/pipelines/#{pipeline}/runs/#{run}/input",
          %{}
        )

      assert json_response(conn, 422)["errors"] != %{}
    end

    test "does not allow input to a not running pipeline run", %{
      conn: conn,
      organization: organization,
      pipeline: pipeline,
      run: run
    } do
      conn =
        post(
          conn,
          ~p"/api/organizations/#{organization}/pipelines/#{pipeline}/runs/#{run}/input",
          %{
            "block_name" => "block",
            "input_name" => "input",
            "data" => "data"
          }
        )

      assert json_response(conn, 400)["errors"] != %{}
    end

    test "sends input to a specific organization pipeline run", %{
      conn: conn,
      organization: organization,
      pipeline: pipeline,
      run: run,
      api_spec: api_spec
    } do
      start_run(%{run: run})

      conn =
        post(
          conn,
          ~p"/api/organizations/#{organization}/pipelines/#{pipeline}/runs/#{run}/input",
          %{
            "block_name" => "block",
            "input_name" => "input",
            "data" => "data"
          }
        )

      response = json_response(conn, 200)
      assert response["data"]["status"] == "running"
      assert_schema(response, "RunShowResponse", api_spec)
    end
  end

  defp start_run(%{run: run}) do
    Pipelines.Runner.start_run(run)
  end

  defp create_run(%{pipeline: pipeline}) do
    run = run_fixture(%{pipeline_id: pipeline.id})
    %{run: run}
  end

  defp create_pipeline(%{organization: organization}) do
    pipeline = pipeline_fixture(%{organization_id: organization.id})
    %{pipeline: pipeline}
  end

  defp create_cost(%{organization: organization, run: run}) do
    cost_fixture(organization, run)
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
