defmodule BuildelWeb.Schemas.Registrations do
  alias OpenApiSpex.Schema

  defmodule Registration do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "Registration",
      type: :object,
      properties: %{
        registration_disabled: %Schema{type: :boolean, description: "Registration disabled flag"}
      },
      required: [:registration_disabled]
    })
  end

  defmodule ShowResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "RegistrationShowResponse",
      type: :object,
      properties: %{
        data: BuildelWeb.Schemas.Registrations.Registration
      },
      required: [:data]
    })
  end
end
