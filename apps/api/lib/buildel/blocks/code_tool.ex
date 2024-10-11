defmodule Buildel.Blocks.CodeTool do
  use Buildel.Blocks.Block
  use Buildel.Blocks.Tool

  # Config

  @impl true
  defdelegate cast(pid, chunk), to: __MODULE__, as: :query

  @impl true
  def options() do
    %{
      type: "code_interpreter",
      description:
        "Used for creating, manipulating and running code in TypeScript and JavaScript.",
      groups: ["tools"],
      inputs: [Block.file_input("file", false)],
      outputs: [Block.text_output()],
      ios: [Block.io("tool", "worker")],
      dynamic_ios: nil,
      schema: schema()
    }
  end

  @impl true
  def schema() do
    %{
      "type" => "object",
      "required" => ["name", "opts"],
      "properties" => %{
        "name" => name_schema(),
        "inputs" => inputs_schema(),
        "opts" =>
          options_schema(%{
            "required" => [],
            "properties" => %{}
          })
      }
    }
  end

  # Client

  def query(pid, {:text, _text} = text) do
    GenServer.cast(pid, {:query, text})
  end

  # Server

  @impl true
  def setup(
        %{
          type: __MODULE__
        } = state
      ) do
    dir_path = Temp.mkdir!()

    # init_bun(dir_path)

    {:ok, state |> Map.put(:dir_path, dir_path)}
  end

  @impl true
  def tools(state) do
    [
      %{
        function: %{
          name: "create_file",
          description: """
          Creates a file with a given name.
          If a given file already exists it overrides it with new content.
          The base folder your file will be created in is #{state.dir_path}.
          IF YOU NEED TO CREATE SCRIPTS REMEMBER TO END THEM WITH .ts.
          IF THE USER ASKS TO GENERATE SOME DATA DO NOT USE CONSOLE.LOG. INSTEAD WRITE RESULTS TO FILES.
          DO NOT READ CREATED FILES UNLESS ASKED.
          """,
          parameters_schema: %{
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
        },
        call_formatter: fn args ->
          path = Path.join([state.dir_path, args["name"]])
          url = "/super-api/files?path=#{path}" |> URI.encode()

          """
          <details>
            <summary>Creating file [#{path}](#{url})</summary>
            ```
            #{args["content"]}
            ```
          </details>
          """
        end,
        response_formatter: fn _response ->
          ""
        end
      },
      %{
        function: %{
          name: "read_file",
          description:
            "Reads a file with a given name. The base folder your file will be read fromi is #{state.dir_path}",
          parameters_schema: %{
            type: "object",
            properties: %{
              name: %{
                type: "string",
                description: "The name of file to create with extension. ie: abc.txt"
              }
            },
            required: ["name"]
          }
        },
        call_formatter: fn args ->
          path = Path.join([state.dir_path, args["name"]])
          url = "/super-api/files?path=#{path}" |> URI.encode()

          """
          <details>
            <summary>Reading file [#{path}](#{url})</summary>
            ```
            #{File.read!(path)}
            ```
          </details>
          """
        end,
        response_formatter: fn _response ->
          ""
        end
      },
      %{
        function: %{
          name: "eval_deno",
          description: """
          CREATE FILES BEFORE EVALUATING THEM.
          Evaluates a Deno compatible typescript .ts file (DOES NOT ALLOW EVALUATING ANY OTHER FILES THAN .ts) and returns the result of script.
          Use npm packages! prefix package with `npm:` like so: `import * as emoji from "npm:node-emoji";`
          The base folder is #{state.dir_path}.
          If you create any files during the process use markdown to reference them.
          Do it in an EXACT FORM '[FILE_NAME](/super-api/files?path=#{state.dir_path}/FILE_NAME)' where FILE_NAME is the name of the file.
          DO NOT REPLACE #{state.dir_path} with 'sandbox'! Keep the full syntax like '[FILE_NAME](/super-api/files?path=#{state.dir_path}/FILE_NAME)'
          """,
          parameters_schema: %{
            type: "object",
            properties: %{
              name: %{
                type: "string",
                description: "The name of file to evaluate"
              }
            },
            required: ["name"]
          }
        },
        call_formatter: fn args ->
          path = Path.join([state.dir_path, args["name"]])
          url = "/super-api/files?path=#{path}" |> URI.encode()

          """
          <details>
            <summary>Running file [#{path}](#{url})</summary>
            ```
            #{File.read!(path)}
            ```
          </details>
          """
        end,
        response_formatter: fn response ->
          """
            <details>
              <summary>Code run result</summary>
              #{response}
            </details>
          """
        end
      }
    ]
  end

  @impl true
  def handle_input("file", {_name, :binary, file_name, metadata}, state) do
    save_file(state, file_name, metadata)
    state
  end

  @impl true
  def handle_tool("tool", "create_file", {_name, :text, args, _}, state) do
    create_file(state, %{name: args["name"], content: args["content"]})

    {"created", state}
  end

  @impl true
  def handle_tool("tool", "read_file", {_name, :text, args, _}, state) do
    content = read_file(state, %{name: args["name"]})

    {content, state}
  end

  @impl true
  def handle_tool("tool", "eval_deno", {_name, :text, args, _}, state) do
    content = eval_deno(state, %{name: args["name"]})

    {content, state}
  end

  @impl true
  def handle_tool("tool", "install_npm_package", {_name, :text, args, _}, state) do
    content = install_package(state, %{name: args["name"]})

    {content, state}
  end

  defp create_file(state, %{name: name, content: content}) do
    folder_path = state.dir_path

    File.write!(Path.join(folder_path, name), content || "")
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

    System.cmd("deno", ["run", "--allow-write=./", "--allow-read=./", name],
      stderr_to_stdout: true,
      cd: folder_path
    )
    |> then(fn {output, status} ->
      %{output: output, status: status} |> Jason.encode!()
    end)
    |> IO.inspect()
  end

  defp install_package(state, %{name: name}) do
    folder_path = state.dir_path

    System.cmd("bun", ["add", name], stderr_to_stdout: true, cd: folder_path)
    |> then(fn {output, status} ->
      %{output: output, status: status} |> Jason.encode!()
    end)
  end

  defp save_file(state, file_name, metadata) do
    File.cp!(file_name, Path.join([state.dir_path, metadata.file_name]))
  end
end
