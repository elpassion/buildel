defmodule Buildel.Blocks.NewImageTest do
  use Buildel.BlockCase, async: true
  alias Blocks.NewImage

  describe "Image" do
    test "exposes options" do
      assert %{
               type: :image,
               description: "Block used to generate images. Can be used as a tool for chat",
               groups: ["image", "tools"],
               inputs: [_],
               outputs: [_],
               ios: [],
               dynamic_ios: nil
             } = NewImage.options()
    end

    test "validates schema correctly" do
      assert :ok =
               Blocks.validate_block(NewImage, %{
                 name: "test",
                 opts: %{
                   api_type: "openai",
                   api_key: "key",
                   endpoint: "https://api.openai.com/v1",
                   model: "model",
                   size: "256x256",
                   quality: "standard",
                   style: "vivid"
                 }
               })

      assert {:error, _} = Blocks.validate_block(NewImage, %{})
    end
  end

  describe "Image Run" do
    setup [:create_run]

    test "outputs file text", %{run: test_run} do
      message =
        Message.new(:text, "create an image")

      test_run
      |> BlocksTestRunner.with_secret(fn "key" ->
        "api_key"
      end)
      |> BlocksTestRunner.with_image_returning(fn
        %{prompt: "create an image", api_key: "api_key"} ->
          {:ok, %{image_url: "url"}}
      end)
      |> BlocksTestRunner.subscribe_to_block("test")
      |> BlocksTestRunner.test_input(message)
      |> assert_receive_message(
        "test",
        :image_url,
        message
        |> Message.from_message()
        |> Message.set_type(:text)
        |> Message.set_message("url")
      )
    end

    def create_run(_) do
      {:ok, run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            NewImage.create(%{
              name: "test",
              opts: %{
                api_key: "key"
              },
              connections: [
                Buildel.BlocksTestRunner.test_text_input_connection(:input)
              ]
            })
          ]
        })

      %{run: run}
    end
  end
end
