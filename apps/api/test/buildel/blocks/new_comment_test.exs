defmodule Buildel.Blocks.NewCommentTest do
  use Buildel.BlockCase, async: true
  alias Blocks.Comment

  describe "Comment" do
    test "exposes options" do
      assert  %{
               type: :comment,
               description: "Block for adding comments to the workflow",
               inputs: [],
               outputs: [],
               groups: ["utils"],
               ios: [],
               dynamic_ios: nil
             } = Comment.options()
    end

    test "validates schema correctly" do
      assert :ok =
               Blocks.validate_block(Comment, %{"name": "test", "opts": %{"content": "test", "color": "red"}})

      assert {:error, _} = Blocks.validate_block(Comment, %{})
    end
  end
end
