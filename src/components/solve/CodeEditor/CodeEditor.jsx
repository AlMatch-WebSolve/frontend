import { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import styles from './CodeEditor.module.css';

function CodeEditor({
  language = 'java',
  theme = 'vs-light',
  value,
  onChange,
  onHotSave,
}) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const isActiveRef = useRef(false);
  const wheelCleanupRef = useRef(null);
  const [fontSize, setFontSize] = useState(18);

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const applyZoom = (editor, next) => {
    editor.updateOptions({
      fontSize: next,
      lineHeight: Math.round(next * 1.5),
    });
  };

  const handleMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    monaco.editor.setTheme(theme);

    // TS 기본 옵션
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowJs: true,
      noEmit: true,
      strict: true,
    });

    editor.onDidFocusEditorText(() => (isActiveRef.current = true));
    editor.onDidBlurEditorText(() => (isActiveRef.current = false));

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (!isActiveRef.current) return;
      onHotSave?.(editor.getValue());
    });

    const zoomIn = () => {
      if (!isActiveRef.current) return;
      setFontSize(prev => {
        const next = clamp(prev + 1, 10, 36);
        applyZoom(editor, next);
        return next;
      });
    };
    const zoomOut = () => {
      if (!isActiveRef.current) return;
      setFontSize(prev => {
        const next = clamp(prev - 1, 10, 36);
        applyZoom(editor, next);
        return next;
      });
    };
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Equal, zoomIn);
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.NumpadAdd, zoomIn);
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Minus, zoomOut);
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.NumpadSubtract, zoomOut);

    const dom = editor.getDomNode();
    const onWheel = (e) => {
      if (!isActiveRef.current || !(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const step = e.deltaY < 0 ? 1 : -1;
      const next = clamp((editor.getOption(monaco.editor.EditorOption.fontSize) || fontSize) + step, 10, 36);
      setFontSize(next);
      applyZoom(editor, next);
    };
    dom?.addEventListener('wheel', onWheel, { passive: false });
    wheelCleanupRef.current = () => dom?.removeEventListener('wheel', onWheel);

    editor.focus();
  };

  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(theme);
    }
  }, [theme]);

  useEffect(() => {
    const onKeyDown = (e) => {
      const key = e.key?.toLowerCase();
      const isCtrlCmd = e.ctrlKey || e.metaKey;
      const isPlus = isCtrlCmd && (key === '+' || (key === '=' && e.shiftKey));
      const isMinus = isCtrlCmd && key === '-';
      const isSave = isCtrlCmd && key === 's';
      if (!editorRef.current?.hasTextFocus?.()) return;
      if (isPlus || isMinus || isSave) e.preventDefault();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => () => wheelCleanupRef.current?.(), []);

  return (
    <div className={styles.editorContainer}>
      <Editor
        width="100%"
        height="100%"
        language={language}
        value={value}
        theme={theme}
        onChange={(v) => onChange?.(v ?? '')}
        onMount={handleMount}
        options={{
          fontFamily: "'Red Hat Mono', 'D2Coding', ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
          automaticLayout: true,
          minimap: { enabled: false },
          mouseWheelZoom: false,
          fontSize,
          lineHeight: Math.round(fontSize * 1.5),
          cursorBlinking: 'blink',
          smoothScrolling: true,
        }}
      />
    </div>
  );
}
export default CodeEditor;