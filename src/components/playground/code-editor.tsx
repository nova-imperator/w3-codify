"use client";

import * as React from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { Loader2 } from "lucide-react";

/**
 * Monaco editor (VS Code engine) with an on-brand dark theme. Monaco is loaded
 * lazily from CDN by @monaco-editor/react, so it never bloats the app bundle.
 */
export function CodeEditor({
  language,
  value,
  onChange,
  readOnly = false,
  height = "100%",
}: {
  language: string;
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  height?: string | number;
}) {
  const onMount: OnMount = (_editor, monaco) => {
    monaco.editor.defineTheme("w3dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#0b0d18",
        "editorGutter.background": "#0b0d18",
        "editor.lineHighlightBackground": "#ffffff0a",
        "editorLineNumber.foreground": "#5b6182",
        "editorIndentGuide.background1": "#ffffff10",
        "focusBorder": "#00000000",
      },
    });
    monaco.editor.setTheme("w3dark");
  };

  return (
    <Editor
      height={height}
      language={language}
      value={value}
      onChange={(v) => onChange?.(v ?? "")}
      onMount={onMount}
      theme="w3dark"
      loading={
        <div className="grid h-full place-items-center text-fg-faint">
          <Loader2 className="size-5 animate-spin" />
        </div>
      }
      options={{
        readOnly,
        minimap: { enabled: false },
        fontSize: 13.5,
        lineHeight: 21,
        scrollBeyondLastLine: false,
        padding: { top: 14, bottom: 14 },
        automaticLayout: true,
        tabSize: 4,
        lineNumbersMinChars: 3,
        fontLigatures: true,
        fontFamily: "var(--font-mono, ui-monospace), SFMono-Regular, Menlo, monospace",
        renderLineHighlight: "line",
        smoothScrolling: true,
        cursorBlinking: "smooth",
        scrollbar: { verticalScrollbarSize: 9, horizontalScrollbarSize: 9 },
        overviewRulerLanes: 0,
      }}
    />
  );
}
