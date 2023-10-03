import { AsyncSelect, IAsyncSelectProps } from "@elpassion/taco/Dropdown";

export type AsyncSelectInputProps = IAsyncSelectProps;

export const AsyncSelectInput: React.FC<AsyncSelectInputProps> = (props) => {
  return (
    <AsyncSelect
      customStyles={{
        control: {
          "background-color": "#454545 !important",
        },
        menu: {
          "background-color": "#454545 !important",
          overflow: "hidden",
        },
        option: {
          "background-color": "#454545 !important",
        },
      }}
      {...props}
    />
  );
};
