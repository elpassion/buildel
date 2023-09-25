defmodule Buildel.SplittersTest do
  use ExUnit.Case

  alias Buildel.Splitters

  describe "recursive_character_text_split/2" do
    @recursive_text """
    Hi.\n\nI'm Harrison.\n\nHow? Are? You?\nOkay then f f f f.
    This is a weird text to write, but gotta test the splittingggg some how.

    Bye!\n\n-H.
    """

    test "recursive_character_text_split/2" do
      text = @recursive_text

      expected_output = [
        "Hi.",
        "I'm",
        "Harrison.",
        "How? Are?",
        "You?",
        "Okay then f",
        "f f f f.",
        "This is a",
        "a weird",
        "text to",
        "write, but",
        "gotta test",
        "the",
        "splitting",
        "gggg",
        "some how.",
        "Bye!\n\n-H."
      ]

      assert expected_output ==
               Splitters.recursive_character_text_split(text |> String.trim(), %{
                 chunk_size: 10,
                 chunk_overlap: 1
               })
    end

    test "1 more" do
      text = "....5X..3Y...4X....5Y..."

      expected_output = [
        "....5",
        "..3",
        "...4",
        "....5",
        "..."
      ]

      assert expected_output ==
               Splitters.recursive_character_text_split(text, %{
                 chunk_size: 5,
                 chunk_overlap: 0,
                 separators: ["X", "Y"]
               })
    end
  end
end
