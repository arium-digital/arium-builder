import * as React from "react";
import { Object3DNode, useThree } from "@react-three/fiber";
import { Group } from "three";
import { Assign } from "utility-types";
// @ts-ignore
import { createRoot } from "react-dom/client";

export interface InvisbileHtmlProps
  extends Omit<
    Assign<
      React.HTMLAttributes<HTMLDivElement>,
      Object3DNode<Group, typeof Group>
    >,
    "ref"
  > {
  portal?: React.MutableRefObject<HTMLElement>;
  prepend?: boolean;
  as?: string;
}

const NonTransformedHtml = React.forwardRef(
  (
    { portal, children, prepend, as = "div" }: InvisbileHtmlProps,
    ref: React.Ref<HTMLDivElement>
  ) => {
    const gl = useThree(({ gl }) => gl);
    const [el] = React.useState(() => document.createElement(as));
    const target = portal?.current ?? gl.domElement.parentNode;

    React.useEffect(() => {
      if (target) {
        if (prepend) target.prepend(el);
        else target.appendChild(el);

        const root = createRoot(el);
        root.render(<div ref={ref} children={children} />);

        return () => {
          root.unmount();
        };
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target]);

    return null;
  }
);

export default NonTransformedHtml;
