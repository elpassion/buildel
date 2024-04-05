defmodule Buildel.PipelinesTest do
  alias Buildel.Blocks.TextInput
  use Buildel.DataCase
  import Buildel.OrganizationsFixtures

  alias Buildel.Pipelines

  describe "pipelines" do
    alias Buildel.Pipelines.Pipeline

    import Buildel.PipelinesFixtures

    @invalid_attrs %{name: nil, config: nil}

    test "list_pipelines/0 returns all pipelines" do
      pipeline = pipeline_fixture()
      assert Pipelines.list_pipelines() == [pipeline]
    end

    test "get_pipeline!/1 returns the pipeline with given id" do
      pipeline = pipeline_fixture()
      assert Pipelines.get_pipeline!(pipeline.id) == pipeline
    end

    test "create_pipeline/1 with valid data creates a pipeline" do
      valid_attrs = %{name: "some name", config: %{}, organization_id: organization_fixture().id}

      assert {:ok, %Pipeline{} = pipeline} = Pipelines.create_pipeline(valid_attrs)
      assert pipeline.name == "some name"
      assert pipeline.config == %{}
    end

    test "create_pipeline/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Pipelines.create_pipeline(@invalid_attrs)
    end

    test "update_pipeline/2 with valid data updates the pipeline" do
      pipeline = pipeline_fixture()
      update_attrs = %{name: "some updated name", config: %{}}

      assert {:ok, %Pipeline{} = pipeline} = Pipelines.update_pipeline(pipeline, update_attrs)
      assert pipeline.name == "some updated name"
      assert pipeline.config == %{}
    end

    test "update_pipeline/2 with invalid data returns error changeset" do
      pipeline = pipeline_fixture()
      assert {:error, %Ecto.Changeset{}} = Pipelines.update_pipeline(pipeline, @invalid_attrs)
      assert pipeline == Pipelines.get_pipeline!(pipeline.id)
    end

    test "delete_pipeline/1 deletes the pipeline" do
      pipeline = pipeline_fixture()
      assert {:ok, %Pipeline{}} = Pipelines.delete_pipeline(pipeline)
      assert_raise Ecto.NoResultsError, fn -> Pipelines.get_pipeline!(pipeline.id) end
    end

    test "change_pipeline/1 returns a pipeline changeset" do
      pipeline = pipeline_fixture()
      assert %Ecto.Changeset{} = Pipelines.change_pipeline(pipeline)
    end

    test "list_organization_pipelines/1 returns all pipelines for given organization" do
      organization = organization_fixture()
      pipeline = pipeline_fixture(organization_id: organization.id)
      _another_pipeline = pipeline_fixture()
      assert Pipelines.list_organization_pipelines(organization) == [pipeline]
    end
  end

  describe "runs" do
    alias Buildel.Pipelines.Run

    import Buildel.PipelinesFixtures

    @invalid_attrs %{}

    test "list_runs/0 returns all runs" do
      %{id: id} = run_fixture()
      assert [%Buildel.Pipelines.Run{id: ^id}] = Pipelines.list_runs()
    end

    test "get_run/1 returns the run with given id" do
      %{id: id} = run = run_fixture()
      assert %Buildel.Pipelines.Run{id: ^id} = Pipelines.get_run(run.id)
    end

    test "create_run/1 with valid data creates a run" do
      pipeline = pipeline_fixture()
      valid_attrs = %{pipeline_id: pipeline.id, config: pipeline.config}

      assert {:ok, %Run{} = run} = Pipelines.create_run(valid_attrs)
      assert run.pipeline_id == pipeline.id
    end

    test "create_run/1 increases pipeline runs_count" do
      pipeline = pipeline_fixture()
      valid_attrs = %{pipeline_id: pipeline.id, config: pipeline.config}

      assert {:ok, %Run{}} = Pipelines.create_run(valid_attrs)
      assert pipeline |> Buildel.Repo.reload() |> Map.get(:runs_count) == 1
    end

    test "create_run/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Pipelines.create_run(@invalid_attrs)
    end

    test "start changes the status to running" do
      run = run_fixture()
      assert {:ok, %Run{} = run} = Pipelines.start(run)
      assert run.status == :running
    end

    test "finish changes the status to finished" do
      run = run_fixture()
      assert {:ok, %Run{} = run} = Pipelines.finish(run)
      assert run.status == :finished
    end
  end

  describe "budget" do
    alias Buildel.Pipelines.Run

    import Buildel.PipelinesFixtures
    import Buildel.CostsFixtures

    test "get_pipeline_costs_by_dates/3 returns correct cost for given dates" do
      organization = organization_fixture()
      pipeline = pipeline_fixture(%{organization_id: organization.id})
      run = run_fixture(%{pipeline_id: pipeline.id})
      %{cost: cost} = cost_fixture(organization, run)
      %{cost: different_cost} = cost_fixture(organization, run)

      start_date = NaiveDateTime.utc_now() |> NaiveDateTime.add(-1, :day)
      end_date = NaiveDateTime.utc_now() |> NaiveDateTime.add(1, :day)

      %{total_cost: total_cost} =
        Pipelines.get_pipeline_costs_by_dates(pipeline, start_date, end_date)

      assert Decimal.eq?(total_cost, Decimal.add(cost.amount, different_cost.amount))
    end

    test "get_pipeline_costs_by_dates/3 returns total_cost 0 if no costs between dates" do
      organization = organization_fixture()
      pipeline = pipeline_fixture(%{organization_id: organization.id})
      run = run_fixture(%{pipeline_id: pipeline.id})
      cost_fixture(organization, run)
      cost_fixture(organization, run)

      start_date = NaiveDateTime.utc_now() |> NaiveDateTime.add(-2, :day)
      end_date = NaiveDateTime.utc_now() |> NaiveDateTime.add(-1, :day)

      %{total_cost: total_cost} =
        Pipelines.get_pipeline_costs_by_dates(pipeline, start_date, end_date)

      assert Decimal.eq?(total_cost, Decimal.new(0))
    end

    test "get_pipeline_costs_for_current_month/1 returns total_cost only for current month" do
      organization = organization_fixture()
      pipeline = pipeline_fixture(%{organization_id: organization.id})
      run = run_fixture(%{pipeline_id: pipeline.id})
      cost_fixture(organization, run, NaiveDateTime.utc_now() |> NaiveDateTime.add(-35, :day))
      %{cost: cost} = cost_fixture(organization, run)
      %{cost: different_cost} = cost_fixture(organization, run)

      %{total_cost: total_cost} =
        Pipelines.get_pipeline_costs_for_current_month(pipeline)

      assert Decimal.eq?(total_cost, Decimal.add(cost.amount, different_cost.amount))
    end

    test "verify_pipeline_budget_limit/1 returns ok if budget not set" do
      organization = organization_fixture()
      pipeline = pipeline_fixture(%{organization_id: organization.id})
      run = run_fixture(%{pipeline_id: pipeline.id})
      cost_fixture(organization, run)
      cost_fixture(organization, run)

      assert {:ok, _} = Pipelines.verify_pipeline_budget_limit(pipeline)
    end

    test "verify_pipeline_budget_limit/1 returns ok if budget not exceeded" do
      organization = organization_fixture()
      pipeline = pipeline_fixture(%{organization_id: organization.id, budget_limit: 250})
      run = run_fixture(%{pipeline_id: pipeline.id})
      cost_fixture(organization, run)
      cost_fixture(organization, run)

      assert {:ok, _} = Pipelines.verify_pipeline_budget_limit(pipeline)
    end

    test "verify_pipeline_budget_limit/1 returns error if budget exceeded" do
      organization = organization_fixture()
      pipeline = pipeline_fixture(%{organization_id: organization.id, budget_limit: 90})
      run = run_fixture(%{pipeline_id: pipeline.id})
      cost_fixture(organization, run)

      assert {:error, _} = Pipelines.verify_pipeline_budget_limit(pipeline)
    end
  end

  describe "blocks" do
    alias Buildel.Pipelines.Run
    alias Buildel.Blocks.Connection
    alias Buildel.Blocks.{AudioInput, SpeechToText, TextOutput, AudioOutput}

    import Buildel.PipelinesFixtures

    test "blocks_for_run/1 returns the blocks for the run in v1" do
      run = run_fixture(%{})

      assert Pipelines.blocks_for_run(run) == [
               TextInput.create(%{
                 name: "input_block",
                 opts: %{metadata: %{}},
                 connections: []
               }),
               AudioInput.create(%{
                 name: "random_block",
                 opts: %{metadata: %{}},
                 connections: []
               }),
               SpeechToText.create(%{
                 name: "random_block_2",
                 opts: %{metadata: %{}, api_key: "some_api_key"},
                 connections: [
                   Connection.from_connection_string(
                     "random_block:output->input?reset=false",
                     "audio",
                     %{
                       to_block_name: "random_block_2",
                       to_type: "audio"
                     }
                   )
                 ]
               }),
               TextOutput.create(%{
                 name: "random_block_3",
                 opts: %{metadata: %{}},
                 connections: [
                   Connection.from_connection_string(
                     "random_block_2:output->input?reset=true",
                     "text",
                     %{
                       to_block_name: "random_block_3",
                       to_type: "text"
                     }
                   )
                 ]
               }),
               AudioOutput.create(%{
                 name: "random_block_4",
                 opts: %{metadata: %{}},
                 connections: [
                   Connection.from_connection_string(
                     "random_block:output->input?reset=true",
                     "audio",
                     %{
                       to_block_name: "random_block_4",
                       to_type: "audio"
                     }
                   )
                 ]
               })
             ]
    end

    test "blocks_for_run/1 returns the blocks for the run in v2" do
      run =
        run_fixture(%{}, %{
          version: "2"
        })

      assert Pipelines.blocks_for_run(run) == [
               AudioInput.create(%{
                 name: "random_block",
                 opts: %{metadata: %{}},
                 connections: []
               }),
               SpeechToText.create(%{
                 name: "random_block_2",
                 opts: %{metadata: %{}, api_key: "some_api_key"},
                 connections: [
                   Connection.from_connection_string(
                     "random_block:output->input?reset=false",
                     "audio",
                     %{
                       to_block_name: "random_block_2",
                       to_type: "audio"
                     }
                   )
                 ]
               }),
               TextOutput.create(%{
                 name: "random_block_3",
                 opts: %{metadata: %{}},
                 connections: [
                   Connection.from_connection_string(
                     "random_block_2:output->input?reset=true",
                     "text",
                     %{
                       to_block_name: "random_block_3",
                       to_type: "text"
                     }
                   )
                 ]
               }),
               AudioOutput.create(%{
                 name: "random_block_4",
                 opts: %{metadata: %{}},
                 connections: [
                   Connection.from_connection_string(
                     "random_block:output->input?reset=true",
                     "audio",
                     %{
                       to_block_name: "random_block_4",
                       to_type: "audio"
                     }
                   )
                 ]
               })
             ]
    end

    test "blocks_for_run/1 returns correcct blocks in v3" do
      run =
        run_fixture(%{}, %{
          version: "3"
        })

      assert Pipelines.blocks_for_run(run) == [
               AudioInput.create(%{
                 name: "random_block",
                 opts: %{metadata: %{}},
                 connections: []
               }),
               SpeechToText.create(%{
                 name: "random_block_2",
                 opts: %{metadata: %{}, api_key: "some_api_key"},
                 connections: [
                   Connection.from_connection_string(
                     "random_block:output->input?reset=false",
                     "audio",
                     %{
                       to_block_name: "random_block_2",
                       to_type: "audio"
                     }
                   )
                 ]
               }),
               TextOutput.create(%{
                 name: "random_block_3",
                 opts: %{metadata: %{}},
                 connections: [
                   Connection.from_connection_string(
                     "random_block_2:output->input?reset=true",
                     "text",
                     %{
                       to_block_name: "random_block_3",
                       to_type: "text"
                     }
                   )
                 ]
               }),
               AudioOutput.create(%{
                 name: "random_block_4",
                 opts: %{metadata: %{}},
                 connections: [
                   Connection.from_connection_string(
                     "random_block:output->input?reset=true",
                     "audio",
                     %{
                       to_block_name: "random_block_4",
                       to_type: "audio"
                     }
                   )
                 ]
               })
             ]
    end
  end
end
