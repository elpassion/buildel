defmodule Buildel.PipelineConfigMigratorTest do
  use ExUnit.Case
  alias Buildel.PipelineConfigMigrator

  describe "#rename_block_types" do
    test "renames block types" do
      config = %{
        "blocks" => [
          %{"type" => "old_type"},
          %{"type" => "another_old_type"},
          %{"type" => "old_type"}
        ]
      }

      assert PipelineConfigMigrator.rename_block_types(config, "old_type", "new_type") ==
               %{
                 "blocks" => [
                   %{"type" => "new_type"},
                   %{"type" => "another_old_type"},
                   %{"type" => "new_type"}
                 ]
               }
    end
  end

  describe "#add_block_opt" do
    test "adds block opt" do
      config = %{
        "blocks" => [
          %{"type" => "old_type", "opts" => %{"opt1" => "value1"}},
          %{"type" => "another_old_type"},
          %{"type" => "old_type", "opts" => %{"opt1" => "value1"}}
        ]
      }

      assert PipelineConfigMigrator.add_block_opt(config, "old_type", "opt2", "value2") ==
               %{
                 "blocks" => [
                   %{"type" => "old_type", "opts" => %{"opt1" => "value1", "opt2" => "value2"}},
                   %{"type" => "another_old_type"},
                   %{"type" => "old_type", "opts" => %{"opt1" => "value1", "opt2" => "value2"}}
                 ]
               }
    end
  end
end
