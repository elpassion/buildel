defmodule Buildel.Definput do
  alias Buildel.Blocks.Utils.Message

  defmacro definput(name, schema, options \\ []) do
    quote do
      {:ok, options} = unquote(options) |> Keyword.validate(public: false)

      case unquote(schema) do
        %{} ->
          ExJsonSchema.Schema.resolve(unquote(schema))

        :binary ->
          nil

        _ ->
          throw("Invalid schema")
      end

      @inputs [
        %Buildel.NewBlock.Input{
          name: unquote(name),
          schema: unquote(schema),
          public: options[:public]
        }
        | @inputs
      ]

      case unquote(schema) do
        %{} ->
          def validate_input(unquote(name), %Message{} = message) do
            case ExJsonSchema.Validator.valid?(unquote(schema), message.message) do
              true -> :ok
              false -> {:error, :invalid_input}
            end
          end

        :binary ->
          def validate_input(unquote(name), %Message{} = message) do
            case is_binary(message.message) do
              true -> :ok
              false -> {:error, :invalid_input}
            end
          end
      end

      def input(unquote(name), %Message{} = message) do
        case validate_input(unquote(name), message) do
          :ok -> handle_input(unquote(name), message)
          {:error, :invalid_input} -> {:error, :invalid_input}
        end
      end
    end
  end
end

defmodule Buildel.Defoutput do
  alias Buildel.Blocks.Utils.Message

  defmacro defoutput(name, schema, _options \\ []) do
    quote do
      case unquote(schema) do
        %{} ->
          ExJsonSchema.Schema.resolve(unquote(schema))

        :binary ->
          nil

        _ ->
          throw("Invalid schema")
      end

      @outputs [%Buildel.NewBlock.Input{name: unquote(name), schema: unquote(schema)} | @outputs]

      case unquote(schema) do
        %{} ->
          defp validate_output(unquote(name), %Message{} = message) do
            case ExJsonSchema.Validator.valid?(unquote(schema), message.message) do
              true -> :ok
              false -> {:error, :invalid_output}
            end
          end

        :binary ->
          defp validate_output(unquote(name), %Message{} = message) do
            case is_binary(message.message) do
              true -> :ok
              false -> {:error, :invalid_output}
            end
          end
      end

      def output(unquote(name), %Message{} = message) do
        validate_output(unquote(name), message)
      end
    end
  end
end

defmodule Buildel.Defblock do
  alias Buildel.Blocks.Utils.Message

  defmacro defblock(type, options_list) do
    quote do
      @options Buildel.Blocks.Utils.Options.new(%{
                 type: unquote(type),
                 description: unquote(options_list)[:description],
                 groups: unquote(options_list)[:groups]
               })
    end
  end
end

defmodule Buildel.NewBlock do
  @doc false
  defmacro __using__(_opts) do
    quote do
      alias Buildel.Blocks.Utils.Message
      alias Buildel.Blocks.Utils.Schemas
      alias Buildel.Blocks.Utils.Options

      import Buildel.Definput
      import Buildel.Defoutput
      import Buildel.Defblock

      @inputs []
      @outputs []

      @before_compile Buildel.NewBlock
    end
  end

  defmacro __before_compile__(_) do
    alias Buildel.Blocks.Utils.Options

    quote do
      def inputs do
        @inputs
      end

      def outputs do
        @outputs
      end

      def options do
        @options
        |> Options.set_inputs(@inputs)
        |> Options.set_outputs(@outputs)
        |> Options.set_ios([])
        |> Options.set_dynamic_ios(nil)
        |> Options.set_schema(%{})
      end
    end
  end
end

defmodule Buildel.NewBlock.Input do
  defstruct [:name, :schema, public: false]
end

defmodule Example do
  use Buildel.NewBlock

  defblock(:text_input,
    description:
      "This module is crafted for the seamless intake and transmission of textual data.",
    groups: ["text", "inputs / outputs"]
  )

  definput(:input, %{"type" => "string"}, public: true)

  def handle_input(:input, %Message{} = message) do
    output(:output, message)
  end

  definput(:forward, %{"type" => "string"})

  def handle_input(:forward, %Message{} = message) do
    output(:output, message)
  end

  defoutput(:output, %{"type" => "string"})
end
