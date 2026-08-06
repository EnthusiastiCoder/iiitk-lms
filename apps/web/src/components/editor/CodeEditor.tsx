"use client";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  height?: string;
}

export function CodeEditor({ value, onChange, language = "python", readOnly = false, height = "200px" }: CodeEditorProps) {
  const extensions = language === "javascript" ? [javascript()] : [python()];

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      extensions={extensions}
      theme={oneDark}
      height={height}
      readOnly={readOnly}
      basicSetup={{ lineNumbers: true, foldGutter: true, autocompletion: true }}
    />
  );
}
