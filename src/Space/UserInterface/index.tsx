/* eslint-disable jsx-a11y/alt-text */
import React from "react";

import { UserInterfaceProps } from "../componentTypes";
import MainControls from "./MainControls";

const UserInterface = (props: UserInterfaceProps) => {
  return (
    <>
      <MainControls {...props} />
    </>
  );
};

export default UserInterface;
