import { AsyncSelect, IAsyncSelectProps } from "@elpassion/taco/Dropdown";

export type AsyncSelectInputProps = IAsyncSelectProps;

export const AsyncSelectInput: React.FC<AsyncSelectInputProps> = (props) => {
  return (
    <AsyncSelect
      customStyles={{
        control: {
          backgroundColor: "#454545 !important",
        },
        menu: {
          backgroundColor: "#454545 !important",
          overflow: "hidden",
          zIndex: 100,
        },

        option: {
          backgroundColor: "#454545 !important",
        },
      }}
      //@ts-ignore
      styles={{
        //@ts-ignore
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        //@ts-ignore
        menu: (base) => ({ ...base, backgroundColor: "#454545" }),
      }}
      {...props}
    />
  );
};
