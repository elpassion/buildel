defmodule Buildel.Blocks.NewImageOutput do
  use Buildel.Blocks.NewBlock


  defblock(:image_output,
    description: "A streamlined module designed for the efficient handling and transmission of images.",
    groups: ["image", "inputs / outputs"]
  )

  definput(:input, schema: %{}, type: :image)

  defoutput(:output, schema: %{}, public: true, type: :image)


  def handle_input(:input, %Message{message: path, type: :binary} = message, state) do
    content = File.read!(path)

    message = message |> Message.set_message(content)

    output(state, :output, message)
    {:ok, state}
  end

  def handle_input(:input, %Message{message: file, type: :file} = message, state) do
    content = File.read!(file.path)

    message = message |> Message.set_message(content) |> Message.set_metadata(%{file_name: file.file_name, file_type: file.file_type})

    output(state, :output, message)
    {:ok, state}
  end
end
