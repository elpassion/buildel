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

  describe "character_text_split/2" do
    test "splits by character count" do
      text = "foo bar baz 123"
      expected_output = ["foo bar", "bar baz", "baz 123"]

      assert Splitters.character_text_split(
               text,
               %{separator: " ", chunk_size: 7, chunk_overlap: 3}
             ) == expected_output
    end

    test "does not create empty documents" do
      text = "foo  bar"
      expected_output = ["foo", "bar"]

      assert Splitters.character_text_split(
               text,
               %{separator: " ", chunk_size: 2, chunk_overlap: 0}
             ) == expected_output
    end

    test "edge cases are separators" do
      text = "f b"
      expected_output = ["f", "b"]

      assert Splitters.character_text_split(
               text,
               %{separator: " ", chunk_size: 2, chunk_overlap: 0}
             ) == expected_output
    end

    test "on long words" do
      text = "foo bar baz a a"
      expected_output = ["foo", "bar", "baz", "a a"]

      assert Splitters.character_text_split(
               text,
               %{separator: " ", chunk_size: 3, chunk_overlap: 1}
             ) == expected_output
    end

    test "on short words first" do
      text = "a a foo bar baz"
      expected_output = ["a a", "foo", "bar", "baz"]

      assert Splitters.character_text_split(
               text,
               %{separator: " ", chunk_size: 3, chunk_overlap: 1}
             ) == expected_output
    end

    test "with longer words than count" do
      text = "foo bar baz 123"
      expected_output = ["foo", "bar", "baz", "123"]

      assert Splitters.character_text_split(
               text,
               %{separator: " ", chunk_size: 1, chunk_overlap: 1}
             ) == expected_output
    end
  end
end
