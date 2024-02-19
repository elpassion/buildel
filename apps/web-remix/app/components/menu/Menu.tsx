import { MenuProps } from "rc-menu";
import { Suspense, lazy } from "react";

const AsyncMenu = lazy(() => import("./MenuImpl"));

export const Menu: React.FC<MenuProps> = (props) => {
  return (
    <Suspense fallback={null}>
      <AsyncMenu {...props} />
    </Suspense>
  );
};
