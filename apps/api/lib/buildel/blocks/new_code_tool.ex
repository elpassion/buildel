defmodule Buildel.Blocks.NewCodeTool do
  use Buildel.Blocks.NewBlock

  defblock(:code_interpreter,
    description: "Used for creating, manipulating and running code in TypeScript and JavaScript.",
    groups: ["tools"]
  )

  definput(:file, schema: %{}, type: :file)
  defoutput(:output, schema: %{})

  deftool(:create_file,
    description: """
    Creates a file with a given name.
    If a given file already exists it overrides it with new content.
    IF YOU NEED TO CREATE SCRIPTS REMEMBER TO END THEM WITH .ts.
    IF THE USER ASKS TO GENERATE SOME DATA DO NOT USE CONSOLE.LOG. INSTEAD WRITE RESULTS TO FILES.
    DO NOT READ CREATED FILES UNLESS ASKED.
    """,
    schema: %{
      type: "object",
      properties: %{
        name: %{
          type: "string",
          description: "The name of file to create with extension. ie: abc.txt"
        },
        content: %{
          type: "string",
          description: "Content to put into the file."
        }
      },
      required: ["name"]
    }
  )

  deftool(:read_file,
    description: "Reads a file with a given name.",
    schema: %{
      type: "object",
      properties: %{
        name: %{
          type: "string",
          description:
            "The name of file to create with extension. ie: abc.txt.  DO NOT SPECIFY PATH. ONLY FILE NAME"
        }
      },
      required: ["name"]
    }
  )

  deftool(:eval_deno,
    description: """
    CREATE FILES BEFORE EVALUATING THEM.
    Evaluates a Deno compatible typescript .ts file (DOES NOT ALLOW EVALUATING ANY OTHER FILES THAN .ts) and returns the result of script.
    Use npm packages or deno packages! prefix package with `npm:` like so: `import * as emoji from "npm:node-emoji";`
    Use the `import` syntax from ESModules NOT CommonJS. Avoid `require` syntax.
    If you create any files during the process use markdown to reference them.
    Do it in an EXACT FORM '[FILE_NAME](/super-api/files?path=/FILE_NAME)' where FILE_NAME is the name of the file.
    """,
    schema: %{
      type: "object",
      properties: %{
        name: %{
          type: "string",
          description: "The name of file to evaluate"
        }
      },
      required: ["name"]
    }
  )

  deftool(:test_deno,
    description: """
    Runs all tests in folder using Deno.test.
    """,
    schema: %{
      type: "object",
      properties: %{
        dummy: %{type: "string"}
      },
      required: []
    }
  )

  def setup(state) do
    dir_path = Temp.mkdir!()
    {:ok, state |> Map.put(:dir_path, dir_path)}
  end

  def handle_input(:file, %Message{message: _file, type: :file} = message, state) do
    save_file(state, message)
    {:ok, state}
  end

  def handle_tool_call(:create_file, %Message{message: %{args: args}} = message, state) do
    create_file(state, %{name: args["name"], content: args["content"]})

    {:ok, Message.from_message(message) |> Message.set_message("created file"), state}
  end

  def handle_tool_call(:read_file, %Message{message: %{args: args}} = message, state) do
    content = read_file(state, %{name: args["name"]})

    {:ok, Message.from_message(message) |> Message.set_message(content), state}
  end

  def handle_tool_call(:eval_deno, %Message{message: %{args: args}} = message, state) do
    content = eval_deno(state, %{name: args["name"]})

    {:ok, Message.from_message(message) |> Message.set_message(content), state}
  end

  def handle_tool_call(:test_deno, %Message{message: %{args: _args}} = message, state) do
    content = test_deno(state, %{})

    {:ok, Message.from_message(message) |> Message.set_message(content), state}
  end

  defp create_file(state, %{name: name, content: nil}) do
    content = ""
    create_file(state, %{name: name, content: content})
  end

  defp create_file(state, %{name: name, content: content}) do
    folder_path = state.dir_path

    content =
      content
      |> String.replace(~s|\\n|, ~s|\n|)
      |> String.replace(~s|\\n|, ~s|\n|)
      |> String.replace(~s|\\"|, ~s|\"|)
      |> String.replace(~s|\\"|, ~s|\"|)

    File.write!(Path.join(folder_path, name), content)
  end

  defp read_file(state, %{name: name}) do
    folder_path = state.dir_path

    case File.read(Path.join(folder_path, name)) do
      {:ok, ""} ->
        {:error, "empty_file"}

      {:error, error} ->
        {:error, to_string(error)}

      {:ok, content} ->
        if String.valid?(content),
          do: content |> String.slice(0..2_000),
          else:
            {:error,
             "File is a binary. Can't show it send the path: [#{name}](/super-api/files?path=#{state.dir_path}/#{name})."}
    end
  end

  defp eval_deno(state, %{name: name}) do
    folder_path = state.dir_path

    System.cmd("deno", ["run", "--allow-write=./", "--allow-read=./", "--quiet", name],
      stderr_to_stdout: true,
      cd: folder_path
    )
    |> then(fn {output, status} ->
      %{output: output, status: status} |> Jason.encode!()
    end)
  end

  defp test_deno(state, _opts) do
    folder_path = state.dir_path

    System.cmd("deno", ["test"],
      stderr_to_stdout: true,
      cd: folder_path
    )
    |> then(fn {output, status} ->
      %{output: output, status: status} |> Jason.encode!()
    end)
  end

  defp save_file(state, message) do
    File.cp!(message.message.path, Path.join([state.dir_path, message.message.file_name]))
    nil
  end
end
