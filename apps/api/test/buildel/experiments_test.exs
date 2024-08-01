defmodule Buildel.ExperimentsTest do
  use Buildel.DataCase, async: true
  import Buildel.OrganizationsFixtures
  import Buildel.PipelinesFixtures
  import Buildel.DatasetsFixtures

  alias Buildel.Experiments

  describe "experiments" do
    alias Buildel.Experiments.Experiment

    import Buildel.ExperimentsFixtures

    @invalid_attrs %{name: nil}

    test "list_experiments/0 returns all experiments" do
      experiment = experiment_fixture()
      assert Experiments.list_experiments() == [experiment]
    end

    test "get_experiment!/1 returns the experiment with given id" do
      experiment = experiment_fixture()
      assert Experiments.get_experiment!(experiment.id) == experiment
    end

    test "create_experiment/1 with valid data creates a experiment" do
      valid_attrs = %{
        name: "some name",
        organization_id: organization_fixture().id,
        pipeline_id: pipeline_fixture().id,
        dataset_id: dataset_fixture().id
      }

      assert {:ok, %Experiment{} = experiment} = Experiments.create_experiment(valid_attrs)
      assert experiment.name == "some name"
    end

    test "create_experiment/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Experiments.create_experiment(@invalid_attrs)
    end

    test "update_experiment/2 with valid data updates the experiment" do
      experiment = experiment_fixture()
      update_attrs = %{name: "some updated name"}

      assert {:ok, %Experiment{} = experiment} =
               Experiments.update_experiment(experiment, update_attrs)

      assert experiment.name == "some updated name"
    end

    test "update_experiment/2 with invalid data returns error changeset" do
      experiment = experiment_fixture()

      assert {:error, %Ecto.Changeset{}} =
               Experiments.update_experiment(experiment, @invalid_attrs)

      assert experiment == Experiments.get_experiment!(experiment.id)
    end

    test "delete_experiment/1 deletes the experiment" do
      experiment = experiment_fixture()
      assert {:ok, %Experiment{}} = Experiments.delete_experiment(experiment)
      assert_raise Ecto.NoResultsError, fn -> Experiments.get_experiment!(experiment.id) end
    end

    test "list_organization_experiments/1 returns all experiments for given organization" do
      organization = organization_fixture()
      experiment = experiment_fixture(organization_id: organization.id)
      _another_experiment = experiment_fixture()
      assert Experiments.list_organization_experiments(organization) == [experiment]
    end
  end
end
