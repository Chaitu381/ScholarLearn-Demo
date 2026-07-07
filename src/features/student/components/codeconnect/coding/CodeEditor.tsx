import { Code2, Moon, PlayCircle, RotateCcw, Send, Sun } from "lucide-react";
import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import type { WheelEvent } from "react";
import type {
  CodingLanguage,
  CodingProblem,
} from "../../../types/codeconnect.types";
import { cn } from "../../../../../shared/utils/cn";

type CodeEditorProps = {
  code: string;
  language: CodingLanguage;
  onCodeChange: (code: string) => void;
  onLanguageChange: (language: CodingLanguage) => void;
  onResetCode: () => void;
  onRun?: () => void;
  onSubmit?: () => void;
  problem: CodingProblem;
  submitLabel?: string;
};

type EditorThemeMode = "dark" | "light";

const languageLabels: Record<CodingLanguage, string> = {
  java: "Java",
  python: "Python",
  javascript: "JavaScript",
  cpp: "C++",
};

const monacoLanguageMap: Record<CodingLanguage, string> = {
  java: "java",
  python: "python",
  javascript: "javascript",
  cpp: "cpp",
};

const fileExtensionMap: Record<CodingLanguage, string> = {
  java: "java",
  python: "py",
  javascript: "js",
  cpp: "cpp",
};

const DARK_THEME_NAME = "scholarlearn-vscode-dark";
const LIGHT_THEME_NAME = "scholarlearn-vscode-light";
const THEME_STORAGE_KEY = "codeconnect-editor-theme";

function readStoredEditorTheme(): EditorThemeMode {
  if (typeof window === "undefined") {
    return "dark";
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return "dark";
}

const handleEditorBeforeMount: BeforeMount = (monaco) => {
  monaco.editor.defineTheme(DARK_THEME_NAME, {
    base: "vs-dark",
    inherit: true,
    semanticHighlighting: false,
    rules: [
      { token: "comment", foreground: "6A9955", fontStyle: "italic" },

      { token: "keyword", foreground: "C586C0", fontStyle: "bold" },
      { token: "keyword.control", foreground: "C586C0", fontStyle: "bold" },
      { token: "keyword.operator", foreground: "D4D4D4" },

      { token: "modifier", foreground: "569CD6" },
      { token: "storage", foreground: "569CD6" },
      { token: "storage.type", foreground: "569CD6" },
      { token: "storage.modifier", foreground: "569CD6" },

      { token: "type", foreground: "4EC9B0" },
      { token: "type.identifier", foreground: "4EC9B0" },
      { token: "identifier.type", foreground: "4EC9B0" },
      { token: "class", foreground: "4EC9B0" },
      { token: "interface", foreground: "4EC9B0" },
      { token: "namespace", foreground: "4EC9B0" },

      { token: "function", foreground: "DCDCAA" },
      { token: "function.call", foreground: "DCDCAA" },
      { token: "method", foreground: "DCDCAA" },
      { token: "identifier.function", foreground: "DCDCAA" },

      { token: "variable", foreground: "9CDCFE" },
      { token: "variable.name", foreground: "9CDCFE" },
      { token: "property", foreground: "9CDCFE" },
      { token: "parameter", foreground: "9CDCFE" },

      { token: "string", foreground: "CE9178" },
      { token: "string.escape", foreground: "D7BA7D" },
      { token: "string.quote", foreground: "CE9178" },

      { token: "number", foreground: "B5CEA8" },
      { token: "number.float", foreground: "B5CEA8" },
      { token: "constant", foreground: "4FC1FF" },
      { token: "constant.language", foreground: "569CD6" },

      { token: "operator", foreground: "D4D4D4" },
      { token: "delimiter", foreground: "D4D4D4" },
      { token: "delimiter.bracket", foreground: "FFD700" },
      { token: "delimiter.parenthesis", foreground: "D4D4D4" },
      { token: "delimiter.square", foreground: "D4D4D4" },
      { token: "delimiter.curly", foreground: "D4D4D4" },

      { token: "tag", foreground: "569CD6" },
      { token: "tag.id", foreground: "569CD6" },
      { token: "tag.class", foreground: "4EC9B0" },
      { token: "attribute.name", foreground: "9CDCFE" },
      { token: "attribute.value", foreground: "CE9178" },

      { token: "invalid", foreground: "F44747" },
      { token: "invalid.illegal", foreground: "F44747" },

      { token: "identifier", foreground: "D4D4D4" },
    ],
    colors: {
      "editor.background": "#1E1E1E",
      "editor.foreground": "#D4D4D4",

      "editorLineNumber.foreground": "#858585",
      "editorLineNumber.activeForeground": "#FFFFFF",

      "editorCursor.foreground": "#AEAFAD",

      "editor.selectionBackground": "#264F78",
      "editor.inactiveSelectionBackground": "#3A3D41",

      "editor.lineHighlightBackground": "#2A2D2E",

      "editorIndentGuide.background1": "#404040",
      "editorIndentGuide.activeBackground1": "#707070",

      "editorBracketMatch.background": "#0064001A",
      "editorBracketMatch.border": "#888888",

      "scrollbarSlider.background": "#79797966",
      "scrollbarSlider.hoverBackground": "#646464B3",
      "scrollbarSlider.activeBackground": "#BFBFBF66",
    },
  });

  monaco.editor.defineTheme(LIGHT_THEME_NAME, {
    base: "vs",
    inherit: true,
    semanticHighlighting: false,
    rules: [
      { token: "comment", foreground: "008000", fontStyle: "italic" },

      { token: "keyword", foreground: "AF00DB", fontStyle: "bold" },
      { token: "keyword.control", foreground: "AF00DB", fontStyle: "bold" },
      { token: "keyword.operator", foreground: "000000" },

      { token: "modifier", foreground: "0000FF" },
      { token: "storage", foreground: "0000FF" },
      { token: "storage.type", foreground: "0000FF" },
      { token: "storage.modifier", foreground: "0000FF" },

      { token: "type", foreground: "267F99" },
      { token: "type.identifier", foreground: "267F99" },
      { token: "identifier.type", foreground: "267F99" },
      { token: "class", foreground: "267F99" },
      { token: "interface", foreground: "267F99" },
      { token: "namespace", foreground: "267F99" },

      { token: "function", foreground: "795E26" },
      { token: "function.call", foreground: "795E26" },
      { token: "method", foreground: "795E26" },
      { token: "identifier.function", foreground: "795E26" },

      { token: "variable", foreground: "001080" },
      { token: "variable.name", foreground: "001080" },
      { token: "property", foreground: "001080" },
      { token: "parameter", foreground: "001080" },

      { token: "string", foreground: "A31515" },
      { token: "string.escape", foreground: "EE0000" },
      { token: "string.quote", foreground: "A31515" },

      { token: "number", foreground: "098658" },
      { token: "number.float", foreground: "098658" },
      { token: "constant", foreground: "0070C1" },
      { token: "constant.language", foreground: "0000FF" },

      { token: "operator", foreground: "000000" },
      { token: "delimiter", foreground: "000000" },
      { token: "delimiter.bracket", foreground: "0431FA" },
      { token: "delimiter.parenthesis", foreground: "000000" },
      { token: "delimiter.square", foreground: "000000" },
      { token: "delimiter.curly", foreground: "000000" },

      { token: "tag", foreground: "800000" },
      { token: "tag.id", foreground: "800000" },
      { token: "tag.class", foreground: "267F99" },
      { token: "attribute.name", foreground: "FF0000" },
      { token: "attribute.value", foreground: "0000FF" },

      { token: "invalid", foreground: "CD3131" },
      { token: "invalid.illegal", foreground: "CD3131" },

      { token: "identifier", foreground: "000000" },
    ],
    colors: {
      "editor.background": "#FFFFFF",
      "editor.foreground": "#000000",

      "editorLineNumber.foreground": "#237893",
      "editorLineNumber.activeForeground": "#0B216F",

      "editorCursor.foreground": "#000000",

      "editor.selectionBackground": "#ADD6FF",
      "editor.inactiveSelectionBackground": "#E5EBF1",

      "editor.lineHighlightBackground": "#F3F8FF",

      "editorIndentGuide.background1": "#D3D3D3",
      "editorIndentGuide.activeBackground1": "#939393",

      "editorBracketMatch.background": "#0064001A",
      "editorBracketMatch.border": "#B9B9B9",

      "scrollbarSlider.background": "#64646440",
      "scrollbarSlider.hoverBackground": "#64646466",
      "scrollbarSlider.activeBackground": "#00000066",
    },
  });
};

export function CodeEditor({
  code,
  language,
  onCodeChange,
  onLanguageChange,
  onResetCode,
  onRun,
  onSubmit,
  problem,
  submitLabel = "Submit",
}: CodeEditorProps) {
  const [themeMode, setThemeMode] = useState<EditorThemeMode>(() =>
    readStoredEditorTheme(),
  );
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const actualLineCount = Math.max(code.split("\n").length, 1);

  const activeThemeName =
    themeMode === "dark" ? DARK_THEME_NAME : LIGHT_THEME_NAME;

  const editorPath = `${problem.id}.${fileExtensionMap[language]}`;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [themeMode]);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    monaco.editor.setTheme(activeThemeName);

    const model = editor.getModel();

    if (model) {
      monaco.editor.setModelLanguage(model, monacoLanguageMap[language]);
    }

    window.requestAnimationFrame(() => {
      editor.layout();
      editor.focus();
    });
  };
  const handleEditorWheelCapture = (event: WheelEvent<HTMLDivElement>) => {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    const scrollTop = editor.getScrollTop();
    const scrollLeft = editor.getScrollLeft();
    const scrollHeight = editor.getScrollHeight();
    const scrollWidth = editor.getScrollWidth();
    const layoutInfo = editor.getLayoutInfo();

    const maxScrollTop = Math.max(0, scrollHeight - layoutInfo.height);
    const maxScrollLeft = Math.max(0, scrollWidth - layoutInfo.width);

    const wantsVerticalScroll = Math.abs(event.deltaY) >= Math.abs(event.deltaX);
    const wantsHorizontalScroll = Math.abs(event.deltaX) > Math.abs(event.deltaY);

    const canScrollDown = event.deltaY > 0 && scrollTop < maxScrollTop - 1;
    const canScrollUp = event.deltaY < 0 && scrollTop > 1;

    const canScrollRight = event.deltaX > 0 && scrollLeft < maxScrollLeft - 1;
    const canScrollLeft = event.deltaX < 0 && scrollLeft > 1;

    const shouldScrollEditor =
      (wantsVerticalScroll && (canScrollDown || canScrollUp)) ||
      (wantsHorizontalScroll && (canScrollRight || canScrollLeft));

    if (!shouldScrollEditor) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    editor.setScrollTop(
      Math.max(0, Math.min(maxScrollTop, scrollTop + event.deltaY)),
    );

    editor.setScrollLeft(
      Math.max(0, Math.min(maxScrollLeft, scrollLeft + event.deltaX)),
    );
  };

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-border bg-surface shadow-card">
      <div className="flex min-h-0 w-full flex-1 flex-col">
        <div className="shrink-0 border-b border-border bg-surface-soft px-4 py-3 sm:px-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
                  <Code2 aria-hidden="true" size={18} strokeWidth={2.6} />
                </span>

                <div className="min-w-0">
                  <p className="truncate text-[11px] font-extrabold uppercase tracking-wide text-text-muted">
                    CodeConnect Workspace
                  </p>

                  <h2
                    className="truncate text-[18px] font-extrabold leading-6 text-text-primary"
                    title={problem.title}
                  >
                    {problem.title}
                  </h2>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              <div className="flex rounded-2xl bg-surface p-1">
                {Object.entries(languageLabels).map(([value, label]) => {
                  const active = language === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      className={cn(
                        "h-9 rounded-xl px-3 text-[12px] font-extrabold transition",
                        active
                          ? "bg-primary text-white shadow-card"
                          : "text-text-secondary hover:bg-primary-soft hover:text-primary-dark",
                      )}
                      onClick={() => onLanguageChange(value as CodingLanguage)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <div className="flex rounded-2xl bg-surface p-1">
                <button
                  type="button"
                  className={cn(
                    "inline-flex h-9 items-center gap-2 rounded-xl px-3 text-[12px] font-extrabold transition",
                    themeMode === "light"
                      ? "bg-primary text-white shadow-card"
                      : "text-text-secondary hover:bg-primary-soft hover:text-primary-dark",
                  )}
                  onClick={() => setThemeMode("light")}
                >
                  <Sun aria-hidden="true" size={15} strokeWidth={2.5} />
                  Light
                </button>

                <button
                  type="button"
                  className={cn(
                    "inline-flex h-9 items-center gap-2 rounded-xl px-3 text-[12px] font-extrabold transition",
                    themeMode === "dark"
                      ? "bg-primary text-white shadow-card"
                      : "text-text-secondary hover:bg-primary-soft hover:text-primary-dark",
                  )}
                  onClick={() => setThemeMode("dark")}
                >
                  <Moon aria-hidden="true" size={15} strokeWidth={2.5} />
                  Dark
                </button>
              </div>

              <button
                type="button"
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-2xl border border-border bg-surface px-3 text-[13px] font-extrabold text-text-primary transition hover:border-primary hover:text-primary-dark"
                onClick={onResetCode}
              >
                <RotateCcw aria-hidden="true" size={15} strokeWidth={2.5} />
                Reset
              </button>
            </div>
          </div>
        </div>

        <div
          onWheelCapture={handleEditorWheelCapture}
          className={
            themeMode === "dark"
              ? "min-h-0 flex-1 overflow-hidden bg-[#1E1E1E]"
              : "min-h-0 flex-1 overflow-hidden bg-white"
          }
        >
          <Editor
            height="100%"
            path={editorPath}
            language={monacoLanguageMap[language]}
            value={code}
            theme={activeThemeName}
            beforeMount={handleEditorBeforeMount}
            onMount={handleEditorMount}
            onChange={(value) => onCodeChange(value ?? "")}
            options={{
              fontSize: 15,
              lineHeight: 24,

              fontFamily:
                "JetBrains Mono, Fira Code, Consolas, Monaco, monospace",
              fontLigatures: true,

              minimap: {
                enabled: false,
              },

              wordWrap: "off",
              tabSize: 4,
              insertSpaces: true,
              detectIndentation: false,
              automaticLayout: true,

              scrollBeyondLastLine: false,
              smoothScrolling: true,

              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",

              roundedSelection: true,
              renderLineHighlight: "line",

              bracketPairColorization: {
                enabled: true,
              },

              guides: {
                indentation: true,
                bracketPairs: true,
              },

              suggestOnTriggerCharacters: true,
              quickSuggestions: {
                other: true,
                comments: false,
                strings: false,
              },

              acceptSuggestionOnEnter: "on",
              autoClosingBrackets: "always",
              autoClosingQuotes: "always",

              formatOnPaste: true,
              formatOnType: true,

              scrollbar: {
                vertical: "auto",
                horizontal: "auto",
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10,

                alwaysConsumeMouseWheel: false,
              },

              overviewRulerLanes: 0,
              hideCursorInOverviewRuler: true,

              padding: {
                top: 16,
                bottom: 16,
              },
            }}
          />
        </div>

        <div className="shrink-0 border-t border-border bg-surface-soft px-5 py-3">
          <div className="flex flex-col gap-2 text-[12px] font-bold text-text-secondary sm:flex-row sm:items-center sm:justify-between">
            <span>
              Language:{" "}
              <span className="font-extrabold text-text-primary">
                {languageLabels[language]}
              </span>
            </span>

            <span>
              Theme:{" "}
              <span className="font-extrabold text-text-primary">
                {themeMode === "dark" ? "Dark" : "Light"}
              </span>
            </span>

            <span>
              Lines:{" "}
              <span className="font-extrabold text-text-primary">
                {actualLineCount}
              </span>
            </span>
          </div>

          {onRun || onSubmit ? (
            <div className="mt-3 flex flex-wrap justify-end gap-2">
              {onRun ? (
                <button
                  type="button"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 text-[12px] font-extrabold text-text-primary transition hover:border-primary hover:text-primary-dark"
                  onClick={onRun}
                >
                  <PlayCircle aria-hidden="true" size={14} strokeWidth={2.5} />
                  Run Code
                </button>
              ) : null}

              {onSubmit ? (
                <button
                  type="button"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-[12px] font-extrabold text-white transition hover:bg-primary-dark"
                  onClick={onSubmit}
                >
                  <Send aria-hidden="true" size={14} strokeWidth={2.5} />
                  {submitLabel}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
