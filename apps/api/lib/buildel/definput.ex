defmodule Buildel.Definput do
  alias Buildel.Blocks.Utils.Message

  defmacro definput(name, schema, _options \\ []) do
    quote do
      case unquote(schema) do
        %{} ->
          ExJsonSchema.Schema.resolve(unquote(schema))

        :binary ->
          nil

        _ ->
          throw("Invalid schema")
      end

      @inputs [%Buildel.NewBlock.Input{name: unquote(name), schema: unquote(schema)} | @inputs]

      def inputs() do
        @inputs
      end

      defoverridable inputs: 0

      alias Buildel.Blocks.Utils.Message

      case unquote(schema) do
        %{} ->
          def validate_input(unquote(name), %Message{} = message) do
            ExJsonSchema.Validator.valid?(unquote(schema), message.message)
          end

        :binary ->
          def validate_input(unquote(name), %Message{} = message) do
            is_binary(message.message)
          end
      end
    end
  end
end

defmodule Buildel.Defoutput do
  alias Buildel.Blocks.Utils.Message

  defmacro defoutput(name, schema, _options \\ []) do
    quote do
      if match?(%{}, unquote(schema)) do
        ExJsonSchema.Schema.resolve(unquote(schema))
      else
        IO.inspect("TEST")
      end

      @outputs [%Buildel.NewBlock.Input{name: unquote(name), schema: unquote(schema)} | @outputs]

      def outputs do
        @outputs
      end

      alias Buildel.Blocks.Utils.Message

      def validate_output(unquote(name), %Message{} = message) do
        ExJsonSchema.Validator.valid?(unquote(schema), message.message)
      end
    end
  end
end

defmodule Buildel.NewBlock do
  @doc false
  defmacro __using__(_opts) do
    quote do
      import Buildel.Definput
      import Buildel.Defoutput

      @inputs []
      @outputs []

      def inputs do
        @inputs
      end

      defoverridable inputs: 0

      def outputs do
        @inputs
      end

      defoverridable outputs: 0
    end
  end
end

defmodule Buildel.NewBlock.Input do
  defstruct [:name, :schema]
end

defmodule Example do
  use Buildel.NewBlock

  definput(:input, %{"type" => "object"}, fn %Message{} = message ->
    output(:output, message)
  end)

  definput(:forward, :binary)
  defoutput(:output, %{"type" => "string"})

  def handle_input(:input, %Message{} = message) do
    validate_input(:input, message)
  end
end
