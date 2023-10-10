import { AsyncSelect, IAsyncSelectProps } from "@elpassion/taco/Dropdown";

export type AsyncSelectInputProps = IAsyncSelectProps;

export const AsyncSelectInput: React.FC<AsyncSelectInputProps> = (props) => {
  return (
    <AsyncSelect
      customStylesOverrides={() => ({
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        menu: (base) => ({
          ...base,
          ...base,
          marginTop: 8,
          marginLeft: 1,
          border: "1px solid #DAE2EB",
          boxShadow: "0px 8px 16px rgba(27, 36, 44, 0.12)",
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "#454545",
        }),
        option: (base, state) => ({
          ...base,
          padding: 0,
          backgroundColor:
            state.isSelected || state.isFocused ? "#454545" : "transparent",
        }),
        control: (base) => ({
          ...base,
          borderRadius: "8px",
          paddingTop: "8px",
          paddingBottom: "8px",
          minHeight: "44px",
          "input:focus": {
            boxShadow: "none",
          },
          fontSize: "14px",
          backgroundColor: "#454545",
        }),
      })}
      {...props}
    />
  );
};
