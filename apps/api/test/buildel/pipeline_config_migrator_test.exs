defmodule Buildel.PipelineConfigMigratorTest do
  use ExUnit.Case
  alias Buildel.PipelineConfigMigrator
  alias Buildel.BlockConfigMigrator

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

  describe "#remove_block_opt" do
    test "removes block opt" do
      config = %{
        "blocks" => [
          %{"type" => "old_type", "opts" => %{"opt1" => "value1", "opt2" => "value2"}},
          %{"type" => "another_old_type"},
          %{"type" => "old_type", "opts" => %{"opt1" => "value1", "opt2" => "value2"}}
        ]
      }

      assert PipelineConfigMigrator.remove_block_opt(config, "old_type", "opt1") ==
               %{
                 "blocks" => [
                   %{"type" => "old_type", "opts" => %{"opt2" => "value2"}},
                   %{"type" => "another_old_type"},
                   %{"type" => "old_type", "opts" => %{"opt2" => "value2"}}
                 ]
               }
    end
  end

  describe "#update_block_config" do
    test "updates block opts" do
      config = %{
        "blocks" => [
          %{"type" => "old_type", "opts" => %{"opt1" => "value1", "opt2" => "value2"}},
          %{"type" => "another_old_type"},
          %{"type" => "old_type", "opts" => %{"opt1" => "value1", "opt2" => "value2"}}
        ]
      }

      assert PipelineConfigMigrator.update_block_config(config, "old_type", fn config ->
               BlockConfigMigrator.add_block_opt(config, "opt3", "new_value1")
               |> BlockConfigMigrator.remove_block_opt("opt2")
             end) ==
               %{
                 "blocks" => [
                   %{
                     "type" => "old_type",
                     "opts" => %{"opt1" => "value1", "opt3" => "new_value1"}
                   },
                   %{"type" => "another_old_type"},
                   %{
                     "type" => "old_type",
                     "opts" => %{"opt1" => "value1", "opt3" => "new_value1"}
                   }
                 ]
               }
    end
  end

  describe "#add_block" do
    test "adds block" do
      config = %{
        "blocks" => [
          %{"type" => "old_type", "opts" => %{"opt1" => "value1", "opt2" => "value2"}},
          %{"type" => "another_old_type"}
        ]
      }

      assert PipelineConfigMigrator.add_block(config, %{
               type: "if",
               name: "if_1",
               opts: %{},
               position: %{"x" => 1352.4950576584902, "y" => -723.5960369026218}
             }) ==
               %{
                 "blocks" => [
                   %{"type" => "old_type", "opts" => %{"opt1" => "value1", "opt2" => "value2"}},
                   %{"type" => "another_old_type"},
                   %{
                     "type" => "if",
                     "name" => "if_1",
                     "opts" => %{},
                     "position" => %{"x" => 1352.4950576584902, "y" => -723.5960369026218}
                   }
                 ]
               }
    end
  end

  describe "#remove_blocks_with_type" do
    test "removes all blocks with type" do
      config = %{
        "blocks" => [
          %{"type" => "old_type", "opts" => %{"opt1" => "value1", "opt2" => "value2"}},
          %{"type" => "another_old_type"},
          %{"type" => "old_type", "opts" => %{"opt1" => "value1", "opt2" => "value2"}}
        ]
      }

      assert PipelineConfigMigrator.remove_blocks_with_type(config, "old_type") ==
               %{
                 "blocks" => [
                   %{"type" => "another_old_type"}
                 ]
               }
    end
  end
end
