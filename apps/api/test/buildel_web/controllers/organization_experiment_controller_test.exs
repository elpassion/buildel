defmodule BuildelWeb.OrganizationExperimentControllerTest do
  use BuildelWeb.ConnCase, async: true
  import Buildel.OrganizationsFixtures
  import Buildel.PipelinesFixtures
  import Buildel.DatasetsFixtures
  import Buildel.ExperimentsFixtures

  alias Buildel.Organizations

  setup %{conn: conn} do
    {:ok,
     conn:
       conn
       |> put_req_header("accept", "application/json")
       |> put_req_header("content-type", "application/json")}
  end

  setup [
    :register_and_log_in_user,
    :create_user_organization,
    :create_pipeline,
    :create_dataset,
    :create_experiment
  ]

  describe "index" do
    test_requires_authentication %{conn: conn, organization: organization} do
      get(conn, ~p"/api/organizations/#{organization.id}/experiments")
    end

    test "does not list experiments from other org", %{
      conn: conn
    } do
      another_organization = organization_fixture()
      experiment_fixture(%{organization_id: another_organization.id})

      conn =
        get(conn, ~p"/api/organizations/#{another_organization.id}/experiments")

      assert json_response(conn, 404)["errors"] != %{}
    end

    test "lists all organization experiments", %{
      conn: conn,
      organization: organization,
      api_spec: api_spec,
      experiment: experiment
    } do
      experiment_id = experiment.id

      conn =
        get(conn, ~p"/api/organizations/#{organization}/experiments")

      response = json_response(conn, 200)
      assert [%{"id" => ^experiment_id}] = response["data"]

      assert_schema(response, "ExperimentIndexResponse", api_spec)
    end
  end

  describe "show" do
    test_requires_authentication %{conn: conn, organization: organization, experiment: experiment} do
      get(conn, ~p"/api/organizations/#{organization.id}/experiments/#{experiment.id}")
    end

    test "does not show experiment from other org", %{
      conn: conn
    } do
      another_experiment = experiment_fixture()

      conn =
        get(
          conn,
          ~p"/api/organizations/#{another_experiment.organization_id}/experiments/#{another_experiment.id}"
        )

      assert json_response(conn, 404)["errors"] != %{}
    end

    test "shows organization experiment", %{
      conn: conn,
      organization: organization,
      experiment: %{id: experiment_id},
      api_spec: api_spec
    } do
      conn =
        get(conn, ~p"/api/organizations/#{organization}/experiments/#{experiment_id}")

      response = json_response(conn, 200)
      assert %{"id" => ^experiment_id} = response["data"]

      assert_schema(response, "ExperimentShowResponse", api_spec)
    end
  end

  describe "create" do
    test_requires_authentication %{conn: conn, organization: organization} do
      post(conn, ~p"/api/organizations/#{organization.id}/experiments")
    end

    test "validates body", %{conn: conn, organization: organization} do
      conn =
        post(conn, ~p"/api/organizations/#{organization.id}/experiments", %{})

      assert json_response(conn, 422)["errors"] != %{}
    end

    test "does not create in other org", %{conn: conn} do
      organization = organization_fixture()
      pipeline = pipeline_fixture(%{organization_id: organization.id})
      dataset = dataset_fixture(%{organization_id: organization.id})

      conn =
        post(conn, ~p"/api/organizations/#{organization.id}/experiments", %{
          experiment: %{
            name: "some name",
            pipeline_id: pipeline.id,
            dataset_id: dataset.id
          }
        })

      assert json_response(conn, 404)["errors"] != %{}
    end

    test "creates an experiment", %{
      conn: conn,
      pipeline: %{id: pipeline_id},
      organization: organization,
      dataset: %{id: dataset_id},
      api_spec: api_spec
    } do
      experiment_name = "some name"

      conn =
        post(conn, ~p"/api/organizations/#{organization.id}/experiments", %{
          experiment: %{
            name: experiment_name,
            pipeline_id: pipeline_id,
            dataset_id: dataset_id
          }
        })

      response = json_response(conn, 201)

      assert %{
               "data" => %{
                 "name" => ^experiment_name,
                 "id" => _,
                 "pipeline" => %{ "id" => ^pipeline_id, "name" => _},
                 "dataset" => %{ "id" => ^dataset_id, "name" => _},
               }
             } = response

      assert_schema(response, "ExperimentShowResponse", api_spec)
    end
  end

  describe "delete" do
    test_requires_authentication %{conn: conn, organization: organization} do
      delete(conn, ~p"/api/organizations/#{organization.id}/experiments/1")
    end

    test "does not delete in other org", %{conn: conn} do
      another_experiment = experiment_fixture()

      conn =
        delete(
          conn,
          ~p"/api/organizations/#{another_experiment.organization_id}/experiments/#{another_experiment}"
        )

      assert json_response(conn, 404)["errors"] != %{}
    end

    test "handles not found", %{
      conn: conn,
      organization: organization
    } do
      another_experiment = experiment_fixture()

      conn =
        delete(
          conn,
          ~p"/api/organizations/#{organization.id}/experiments/#{another_experiment}"
        )

      assert json_response(conn, 404)["errors"] != %{}
    end

    test "deletes experiment", %{conn: conn, organization: organization, experiment: experiment} do
      conn =
        delete(
          conn,
          ~p"/api/organizations/#{organization}/experiments/#{experiment}"
        )

      assert json_response(conn, 200) == %{}
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

  defp create_dataset(%{organization: organization}) do
    dataset = dataset_fixture(%{organization_id: organization.id})
    %{dataset: dataset}
  end

  defp create_experiment(%{organization: organization, dataset: dataset, pipeline: pipeline}) do
    experiment =
      experiment_fixture(%{
        organization_id: organization.id,
        dataset_id: dataset.id,
        pipeline_id: pipeline.id
      })

    %{experiment: experiment}
  end
end
