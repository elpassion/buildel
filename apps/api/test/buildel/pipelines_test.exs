defmodule Buildel.PipelinesTest do
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
      run = run_fixture()
      assert Pipelines.list_runs() == [run]
    end

    test "get_run/1 returns the run with given id" do
      run = run_fixture()
      assert Pipelines.get_run(run.id) == run
    end

    test "create_run/1 with valid data creates a run" do
      pipeline = pipeline_fixture()
      valid_attrs = %{pipeline_id: pipeline.id}

      assert {:ok, %Run{} = run} = Pipelines.create_run(valid_attrs)
      assert run.pipeline_id == pipeline.id
    end

    test "create_run/1 increases pipeline runs_count" do
      pipeline = pipeline_fixture()
      valid_attrs = %{pipeline_id: pipeline.id}

      assert {:ok, %Run{}} = Pipelines.create_run(valid_attrs)
      assert pipeline |> Buildel.Repo.reload() |> Map.get(:runs_count) == 1
    end

    test "create_run/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Pipelines.create_run(@invalid_attrs)
    end

    test "change_run/1 returns a run changeset" do
      run = run_fixture()
      assert %Ecto.Changeset{} = Pipelines.change_run(run)
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
end
