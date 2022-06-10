import styles from "../../css/controls.module.scss";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  MutableRefObject,
} from "react";
import clsx from "clsx";
import { useCurrentValueFromObservable } from "hooks/useObservable";
import { Observable } from "rxjs";

const NameEditor = ({
  setKeyboardControlsDisabled,
  name$,
  setName,
  disabled,
  nameFieldRef,
}: {
  setKeyboardControlsDisabled: (disabled: boolean) => void;
  name$: Observable<string | null>;
  setName: (name: string) => void;
  disabled?: boolean;
  nameFieldRef: MutableRefObject<HTMLInputElement | null>;
}) => {
  // const [name, setName] = useState(existingName || "");
  const unfocusRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);

  const handleFieldChanged = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setName(event.target.value);
    },
    [setName]
  );

  const doneEditing = useCallback(() => {
    nameFieldRef.current?.blur();
    unfocusRef.current?.focus();
    setEditing(false);
  }, [nameFieldRef]);

  useEffect(() => {
    if (editing) {
      setTimeout(() => {
        document.addEventListener("click", doneEditing);
      }, 100);

      return () => {
        document.removeEventListener("click", doneEditing);
      };
    }
  }, [editing, doneEditing]);

  useEffect(() => {
    setKeyboardControlsDisabled(editing);
  }, [editing, setKeyboardControlsDisabled]);

  const handleDoneTyping = useCallback(() => {
    setEditing(false);
  }, []);

  const handleTyping = useCallback(() => {
    setEditing(true);
  }, []);

  const handleKeyPressed = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        doneEditing();
      }
    },
    [doneEditing]
  );

  const handleClicked = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const style = useMemo(() => {
    if (editing) {
      return {
        color: "white",
        opacity: 1,
      };
    } else return { color: "white" };
  }, [editing]);

  const name = useCurrentValueFromObservable(name$, "");

  return (
    <>
      <input
        value={name || ""}
        onClick={handleClicked}
        onFocus={handleTyping}
        onBlur={handleDoneTyping}
        onKeyPress={handleKeyPressed}
        onChange={handleFieldChanged}
        className={clsx(styles.sidebarDisplaynameInput, styles.fullWidth)}
        style={style}
        placeholder="Your Name..."
        ref={nameFieldRef}
        disabled={disabled}
      />
      {/* below is so that we can unfocus: */}
      <input
        type="text"
        ref={unfocusRef}
        style={{ height: "0", width: "0", opacity: 0, position: "absolute" }}
      ></input>
    </>
  );
};

export default NameEditor;
