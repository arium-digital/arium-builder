import React, { useCallback, useEffect, useState, useRef } from "react";
import { StringDict } from "../../types";
import TextField from "@material-ui/core/TextField";
import { useAuthentication } from "../../hooks/auth/useAuthentication";

export const UserPreview = ({
  setPeerMetadata,
  peerMetadata,
  setKeyboardControlsDisabled,
}: {
  setPeerMetadata: React.Dispatch<React.SetStateAction<StringDict | undefined>>;
  peerMetadata: StringDict | undefined;
  setKeyboardControlsDisabled: (disabled: boolean) => void;
}) => {
  const [name, setName] = useState(peerMetadata?.name);
  const nameFieldRef = useRef<HTMLDivElement>(null);
  const unfocusRef = useRef<HTMLInputElement>(null);

  const { user } = useAuthentication({ ensureSignedInAnonymously: false });

  const [editing, setEditing] = useState(false);

  const updatePeerMetadataFromName = useCallback(
    (name: string | undefined) => {
      setPeerMetadata((existing) => {
        if (!name) return existing;
        if (!existing) {
          return { name };
        } else {
          return {
            ...existing,
            name,
          };
        }
      });
    },
    [setPeerMetadata]
  );

  const updatePeerMetadata = useCallback(() => {
    setName((name) => {
      updatePeerMetadataFromName(name);
      return name;
    });
  }, [updatePeerMetadataFromName]);

  const [throttlingUpdate, setThrottlingUpdate] = useState(false);

  useEffect(() => {
    if (!throttlingUpdate) {
      updatePeerMetadataFromName(name);
      setThrottlingUpdate(true);
    } else {
      if (name !== peerMetadata?.name) {
        const timeout = setTimeout(() => {
          setThrottlingUpdate(false);
        }, 400);

        return () => {
          clearTimeout(timeout);
        };
      }
    }
  }, [name, updatePeerMetadataFromName, throttlingUpdate, peerMetadata?.name]);

  const handleFieldChanged = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setName(event.target.value);
    },
    []
  );

  const doneEditing = useCallback(() => {
    nameFieldRef.current?.blur();
    unfocusRef.current?.focus();
    setEditing(false);
  }, []);

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
    if (!editing) {
      updatePeerMetadata();
    }
  }, [editing, updatePeerMetadata]);

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

  return (
    <>
      <form noValidate autoComplete="off">
        <TextField
          label="Display Name"
          id="standard-size-normal"
          defaultValue={user?.displayName ? user?.displayName : ""}
          onClick={handleClicked}
          onFocus={handleTyping}
          onBlur={handleDoneTyping}
          onKeyPress={handleKeyPressed}
          onChange={handleFieldChanged}
          ref={nameFieldRef}
        />
      </form>
      {/* below is so that we can unfocus: */}
      <input
        type="text"
        ref={unfocusRef}
        style={{ height: "0", width: "0", opacity: 0 }}
      ></input>
    </>
  );
};
