/* eslint-disable jsx-a11y/alt-text */
import React from "react";

import { UserInterfaceProps } from "../componentTypes";
import MainControls from "./MainControls";
import JoinStatusDisplay from "./JoinStatusDisplay";

const UserInterface = (props: UserInterfaceProps) => {
  const { joinStatus } = props;

  return (
    <>
      <MainControls {...props} />
      <JoinStatusDisplay joinStatus={joinStatus} />
    </>
  );
};

export default UserInterface;
