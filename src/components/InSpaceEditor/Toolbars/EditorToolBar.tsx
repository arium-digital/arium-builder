import React from "react";
import {
  HasEditorState,
  // TransformControlMode,
} from "components/InSpaceEditor/types";
import styles from "../styles.module.scss";
import { round } from "lodash";
import { Vector3 } from "three";
import { Table } from "react-bootstrap";
import { useCloseEditorAction } from "../hooks/useEditorActions";
import LeftToolBar from "./LeftToolbar";

export const RenderAllAxesValues = ({
  mode,
  vector,
}: {
  mode: string;
  vector: Vector3;
}) => {
  const table: Array<[string, number]> = [
    ["X", round(vector.x, 2)],
    ["Y", round(vector.y, 2)],
    ["Z", round(vector.z, 2)],
  ];
  return (
    <Table size="sm" borderless className="text-left mb-0">
      <thead>
        <tr>
          <th colSpan={2}>{mode}</th>
        </tr>
      </thead>
      <tbody>
        {table.map(([axis, value]) => (
          <tr key={axis}>
            <td>
              <strong>{axis}</strong>
            </td>
            <td style={{ textAlign: "right" }}>{value}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

const ExitButton = ({ editorState }: HasEditorState) => {
  const handleClose = useCloseEditorAction(editorState);
  return (
    <button onClick={handleClose} className={styles.exitBtn}>
      <img alt="icon" src={"/images/icons/editor-exit.svg"} />
    </button>
  );
};

const NullGuard = ({
  editorState,
  handleToggleTree,
  treeOpen,
}: HasEditorState & {
  handleToggleTree: () => void;
  treeOpen: boolean;
}) => {
  if (!editorState) return null;
  return (
    <>
      <ExitButton editorState={editorState} />
      <LeftToolBar
        editorState={editorState}
        handleToggleTree={handleToggleTree}
        treeOpen={treeOpen}
      />
    </>
  );
};

export default NullGuard;
