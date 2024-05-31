defmodule BuildelWeb.OrganizationPipelineRunLogsControllerTest do
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

  setup [
    :register_and_log_in_user,
    :create_user_organization,
    :create_pipeline,
    :create_run,
    :create_run_log
  ]

  describe "index" do
    test_requires_authentication %{
      conn: conn,
      organization: organization,
      pipeline: pipeline,
      run: run
    } do
      get(conn, ~p"/api/organizations/#{organization}/pipelines/#{pipeline}/runs/#{run}/logs")
    end

    test "does not allow access to other organizations", %{
      conn: conn,
      pipeline: pipeline
    } do
      other_organization = organization_fixture()

      conn =
        get(
          conn,
          ~p"/api/organizations/#{other_organization.id}/pipelines/#{pipeline.id}/runs/1/logs"
        )

      assert json_response(conn, 404)
    end

    test "lists organization pipeline run latest logs", %{
      conn: conn,
      organization: organization,
      pipeline: pipeline,
      run: run,
      api_spec: api_spec
    } do
      conn =
        get(
          conn,
          ~p"/api/organizations/#{organization.id}/pipelines/#{pipeline.id}/runs/#{run.id}/logs"
        )

      response = json_response(conn, 200)
      assert [_] = response["data"]

      assert_schema(response, "LogIndexResponse", api_spec)
    end

    test "filters by block name", %{
      conn: conn,
      organization: organization,
      pipeline: pipeline,
      run: run,
      api_spec: api_spec
    } do
      log_fixture(%{
        run_id: run.id,
        message: "Test log",
        block_name: "chat_1",
        context: "context",
        message_types: ["start_stream", "stop_stream"],
        raw_logs: [1, 2]
      })

      log_fixture(%{
        run_id: run.id,
        message: "Test log 2",
        block_name: "text_input_1",
        context: "context",
        message_types: ["start_stream", "stop_stream"],
        raw_logs: [1, 2]
      })

      conn =
        get(
          conn,
          ~p"/api/organizations/#{organization.id}/pipelines/#{pipeline.id}/runs/#{run.id}/logs?block_name=text_input_1"
        )

      response = json_response(conn, 200)
      assert 1 = length(response["data"])

      assert [
               %{
                 "message" => "Test log 2",
                 "block_name" => "text_input_1"
               }
             ] = response["data"]

      assert_schema(response, "LogIndexResponse", api_spec)
    end

    test "filters by date", %{
      conn: conn,
      organization: organization,
      pipeline: pipeline,
      run: run,
      api_spec: api_spec
    } do
      log_fixture(%{
        run_id: run.id,
        message: "Test log",
        block_name: "chat_1",
        context: "context",
        message_types: ["start_stream", "stop_stream"],
        raw_logs: [1, 2],
        inserted_at: NaiveDateTime.utc_now() |> NaiveDateTime.add(-2, :day)
      })

      start_date =
        NaiveDateTime.utc_now() |> NaiveDateTime.add(-3, :day) |> NaiveDateTime.to_iso8601()

      end_date =
        NaiveDateTime.utc_now() |> NaiveDateTime.add(-1, :day) |> NaiveDateTime.to_iso8601()

      conn =
        get(
          conn,
          ~p"/api/organizations/#{organization.id}/pipelines/#{pipeline.id}/runs/#{run.id}/logs?start_date=#{start_date}&end_date=#{end_date}"
        )

      response = json_response(conn, 200)
      assert 1 = length(response["data"])

      assert [
               %{
                 "message" => "Test log",
                 "block_name" => "chat_1"
               }
             ] = response["data"]

      assert_schema(response, "LogIndexResponse", api_spec)
    end
  end

  defp create_run_log(%{run: run}) do
    log =
      log_fixture(%{
        run_id: run.id,
        message: "Test log",
        block_name: "chat_1",
        context: "context",
        message_types: ["start_stream", "stop_stream"],
        raw_logs: [1, 2]
      })

    %{log: log}
  end

  defp create_run(%{pipeline: pipeline}, date \\ nil) do
    run = run_fixture(%{pipeline_id: pipeline.id}, %{version: "1"}, date)
    %{run: run}
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
