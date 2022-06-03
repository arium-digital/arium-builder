import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Editor } from "react-draft-wysiwyg";
import { convertToRaw, ContentState } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import React from "react";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import { Button, ButtonProps } from "@material-ui/core";
import merge from "lodash/merge";

const SerializationErrorContent = `
<p>Failed loading previous data.</p>
`;

const editorStyle = {
  maxHeight: "320px",
  overflow: "scroll",
  padding: "12px",
};

const defaultToolBarConfig = {
  options: [
    "inline",
    "blockType",
    "list",
    "textAlign",
    "colorPicker",
    "link",
    "history",
  ],
  inline: {
    inDropdown: true,
    options: ["bold", "italic", "underline", "strikethrough", "monospace"],
  },
  blockType: {
    inDropdown: true,
    options: [
      "Normal",
      "H1",
      "H2",
      "H3",
      "H4",
      "H5",
      "H6",
      "Blockquote",
      "Code",
    ],
  },
  list: { inDropdown: true },
  textAlign: { inDropdown: true },
  link: { inDropdown: true },
  history: { inDropdown: true },
  colorPicker: {
    colors: [
      "rgba(255,255,255, 0)",
      "rgb(97,189,109)",
      "rgb(26,188,156)",
      "rgb(84,172,210)",
      "rgb(44,130,201)",
      "rgb(147,101,184)",
      "rgb(71,85,119)",
      "rgb(204,204,204)",
      "rgb(65,168,95)",
      "rgb(0,168,133)",
      "rgb(61,142,185)",
      "rgb(41,105,176)",
      "rgb(85,57,130)",
      "rgb(40,50,78)",
      "rgb(0,0,0)",
      "rgb(247,218,100)",
      "rgb(251,160,38)",
      "rgb(235,107,86)",
      "rgb(226,80,65)",
      "rgb(163,143,132)",
      "rgb(239,239,239)",
      "rgb(255,255,255)",
      "rgb(250,197,28)",
      "rgb(243,121,52)",
      "rgb(209,72,65)",
      "rgb(184,49,47)",
      "rgb(124,112,107)",
      "rgb(209,213,216)",
    ],
  },
};

const htmlToContentState = (html: string) => {
  let contentBlock = htmlToDraft(html);
  if (!contentBlock) contentBlock = htmlToDraft(SerializationErrorContent);
  return ContentState.createFromBlockArray(contentBlock.contentBlocks);
};

interface IRichTextEditorProps {
  initialValue: string;
  handleChange: (value: string) => void;
  flushEditorContentRef?: any;
  toolBarConfigOverride?: any;
}
const RichTextEditor: FC<IRichTextEditorProps> = ({
  initialValue,
  handleChange,
  flushEditorContentRef,
  toolBarConfigOverride,
}) => {
  const [contentState, setContentState] = useState<ContentState>(
    htmlToContentState(initialValue)
  );

  const toolBarConfig = useMemo(
    () => merge(defaultToolBarConfig, toolBarConfigOverride),
    [toolBarConfigOverride]
  );

  const onContentChange = useCallback(
    (newContent) => {
      const html = draftToHtml(newContent);
      handleChange(html);
    },
    [handleChange]
  );

  useEffect(() => {
    if (flushEditorContentRef != null) {
      flushEditorContentRef.current = (html: string) => {
        setContentState(htmlToContentState(html));
      };
    }
  }, [flushEditorContentRef]);

  return (
    <Editor
      editorStyle={editorStyle}
      contentState={convertToRaw(contentState)}
      onContentStateChange={onContentChange}
      toolbar={toolBarConfig}
      handlePastedText={() => false}
    />
  );
};

const neverRerender = (props1: any, props2: any) => {
  return true;
};
const MemorizedEditor = React.memo(RichTextEditor, neverRerender);

export const useEditorAndSaveButton = (
  handleSave: (value: string) => void,
  initHtml: string
) => {
  // console.log(initHtml);
  const [html, setHtml] = useState<string>(initHtml);

  const [dirty, setDirty] = useState(false);

  const handleEditorChange = useCallback(
    (newHtml: string) => {
      setHtml((prevHtml) => {
        if (prevHtml !== newHtml) {
          setDirty(true);
        }
        return newHtml;
      });
    },
    [setHtml]
  );

  const manualSave = useCallback(() => {
    handleSave(html);
    setDirty(false);
  }, [handleSave, html]);
  type Btn = FC<Omit<ButtonProps, "onClick">>;
  type Editor = FC<Omit<IRichTextEditorProps, "initialValue" | "handleChange">>;

  const wrappedButton: Btn = (props) => (
    <Button {...props} onClick={manualSave} disabled={!dirty} />
  );

  const editorRef = useCallback<Editor>(
    (props) => (
      <MemorizedEditor
        {...props}
        initialValue={initHtml}
        handleChange={handleEditorChange}
      />
    ),
    [initHtml, handleEditorChange]
  );

  return [editorRef, wrappedButton];
};

export default MemorizedEditor;
