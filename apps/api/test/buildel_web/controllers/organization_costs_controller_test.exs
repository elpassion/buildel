defmodule BuildelWeb.OrganizationCostsControllerTest do
  use BuildelWeb.ConnCase, async: true
  import Buildel.OrganizationsFixtures
  import Buildel.PipelinesFixtures
  import Buildel.MemoriesFixtures
  import Buildel.CostsFixtures

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
    :create_memory_collection,
    :create_run,
    :create_costs
  ]

  describe "index" do
    test_requires_authentication %{conn: conn, organization: organization} do
      get(conn, ~p"/api/organizations/#{organization.id}/costs")
    end

    test "lists organization costs", %{
      conn: conn,
      organization: organization,
      api_spec: api_spec,
      costs: [cost_1, cost_2]
    } do
      conn = get(conn, ~p"/api/organizations/#{organization.id}/costs")

      response = json_response(conn, 200)

      cost_1_id = cost_1.id
      cost_2_id = cost_2.id

      assert [
               %{
                 "id" => ^cost_2_id
               },
               %{
                 "id" => ^cost_1_id
               }
             ] = response["data"]

      assert_schema(response, "OrganizationCostsIndexResponse", api_spec)
    end
  end

  defp create_user_organization(%{user: user}) do
    membership = membership_fixture(%{user_id: user.id})
    organization = membership |> Map.get(:organization_id) |> Organizations.get_organization!()
    another_organization = organization_fixture()
    %{organization: organization, another_organization: another_organization}
  end

  defp create_pipeline(%{organization: organization}) do
    pipeline = pipeline_fixture(%{organization_id: organization.id})
    %{pipeline: pipeline}
  end

  defp create_memory_collection(%{organization: organization}) do
    collection = collection_fixture(%{organization_id: organization.id})
    %{collection: collection}
  end

  defp create_run(%{pipeline: pipeline}) do
    run = run_fixture(%{pipeline_id: pipeline.id}, %{version: "1"})
    %{run: run}
  end

  defp create_costs(%{organization: organization, run: run, collection: collection}) do
    %{cost: cost_1} =
      cost_fixture(organization, run, NaiveDateTime.utc_now() |> NaiveDateTime.add(-1, :day))

    %{cost: cost_2} = cost_fixture(organization, collection)
    %{costs: [cost_1, cost_2]}
  end
end
