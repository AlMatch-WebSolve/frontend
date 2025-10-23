import { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import styles from './CodeEditor.module.css';

// --- 언어별 기본 템플릿 (Monaco 언어키 기준) ---
const TEMPLATES = {
  java: `// Write your solution here
import java.io.*;
import java.util.*;

public class Main {
  public static void main(String[] args) throws Exception {
    System.out.println("Hello World!");
  }
}
`,

  javascript: `// Write your solution here
function solve(input) {
  console.log("Hello World!")
}
// Node.js: solve(require('fs').readFileSync(0, 'utf8'))
`
  ,

  python: `# Write your solution here
def solve():
    print("Hello World!")

if __name__ == "__main__":
    solve()
`,
};

// 파일명 → Monaco 언어키
const extToLang = (fileName = '') => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'java': return 'java';
    case 'py': return 'python';
    case 'js': return 'javascript';
    default: return null;
  }
};

function CodeEditor({
  language = 'java',
  theme = 'vs-light',
  value,
  onChange,
  onHotSave,
  fileName, // 파일명 받아서 템플릿 언어 결정에 활용
}) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const isActiveRef = useRef(false);
  const wheelCleanupRef = useRef(null);
  const [fontSize, setFontSize] = useState(18);

  // 템플릿 1회 자동 주입 가드
  const didPrefillRef = useRef(false);
  const lastFileRef = useRef(fileName ?? '');

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const applyZoom = (editor, next) => {
    editor.updateOptions({
      fontSize: next,
      lineHeight: Math.round(next * 1.5),
    });
  };

  // 비어있는 코드로 첫 진입 시 템플릿 자동 채우기
  const tryPrefillTemplate = () => {
    if (didPrefillRef.current) return;
    const hasValue = (value ?? '').trim().length > 0;
    if (hasValue) { // 이미 코드가 있으면 주입하지 않음
      didPrefillRef.current = true;
      return;
    }
    const langFromFile = extToLang(fileName);
    const lang = langFromFile || language || 'java';
    const tpl = TEMPLATES[lang];
    if (tpl && onChange) {
      onChange(tpl);
      didPrefillRef.current = true;
    }
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

    // mount 시 1회 템플릿 시도
    tryPrefillTemplate();

    editor.focus();
  };

  // 테마 반영
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(theme);
    }
  }, [theme]);

  // 키 차단
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

  // wheel cleanup
  useEffect(() => () => wheelCleanupRef.current?.(), []);

  // 파일이 바뀌었고, 새 파일 코드가 비어있다면 템플릿 다시 1회 주입
  useEffect(() => {
    if (lastFileRef.current !== (fileName ?? '')) {
      // 새 파일로 전환되면 다시 한 번 템플릿 주입을 허용
      didPrefillRef.current = false;
      lastFileRef.current = fileName ?? '';
      tryPrefillTemplate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileName]);

  // 언어 변경 + 여전히 비어있으면 1회 템플릿 시도
  useEffect(() => {
    tryPrefillTemplate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, value]);

  return (
    <div className={styles.editorContainer}>
      <Editor
        width="100%"
        height="100%"
        language={language || extToLang(fileName) || 'java'}
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
