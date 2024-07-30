defmodule Buildel.Blocks.CommentTest do
  use Buildel.BlockCase, async: true
  alias Blocks.Comment

  describe "Comment" do
    test "exposes options" do
      assert Comment.options() == %{
               type: "comment",
               description: "",
               inputs: [],
               outputs: [],
               schema: Comment.schema(),
               groups: ["utils"],
               ios: [],
               dynamic_ios: nil
             }
    end

    test "validates schema correctly" do
      assert :ok =
               Blocks.validate_block(Comment, %{"name" => "test", "opts" => %{}, "inputs" => []})

      assert {:error, _} = Blocks.validate_block(Comment, %{})
    end
  end
end
