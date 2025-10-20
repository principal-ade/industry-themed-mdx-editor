import type { Theme } from '@a24z/industry-theme';
import {
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import '../styles/mdx-editor-theme.css';
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from 'react';

export interface ThemedMDXEditorProps extends Omit<MDXEditorProps, 'className' | 'contentEditableClassName'> {
  /**
   * Industry theme object to use for theming the editor
   */
  theme: Theme;
  /**
   * Custom loading component
   */
  loadingComponent?: React.ReactNode;
  /**
   * Initial value to seed the editor with when used in uncontrolled mode
   */
  initialValue?: string;
  /**
   * Callback invoked when the editor content should be saved (e.g., via Ctrl/Cmd+S)
   */
  onSave?: (value: string, context: { filePath?: string }) => void | Promise<void>;
  /**
   * Optional file path used to provide additional context to save handlers
   */
  filePath?: string;
  /**
   * Enable the Ctrl/Cmd+S save shortcut (defaults to true)
   */
  enableSaveShortcut?: boolean;
  /**
   * Optional callback that is notified when the dirty state changes
   */
  onDirtyChange?: (isDirty: boolean) => void;
  /**
   * Hide the built-in status bar (for save indicators)
   * Useful when the parent component wants to show its own UI
   */
  hideStatusBar?: boolean;
  /**
   * Additional CSS class names to apply to the editor container
   */
  containerClassName?: string;
  /**
   * Additional styles to apply to the editor container
   */
  containerStyle?: React.CSSProperties;
  /**
   * Show loading state initially
   */
  showLoadingState?: boolean;
}

/**
 * A MDX editor component that integrates with industry-theme
 */
export const ThemedMDXEditor = forwardRef<MDXEditorMethods, ThemedMDXEditorProps>((props, ref) => {
  const {
    theme,
    loadingComponent,
    initialValue,
    onSave,
    filePath,
    enableSaveShortcut = true,
    onDirtyChange,
    hideStatusBar = false,
    containerClassName = '',
    containerStyle = {},
    showLoadingState = false,
    markdown: controlledMarkdown,
    onChange: externalOnChange,
    ...restEditorProps
  } = props;

  const editorRef = useRef<MDXEditorMethods>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(showLoadingState);
  const prevFilePathRef = useRef<string | undefined>(filePath);
  const prevInitialValueRef = useRef<string | undefined>(initialValue);

  const isControlled = controlledMarkdown !== undefined;

  const computeInitialValue = useCallback(() => {
    if (initialValue !== undefined) return initialValue;
    if (typeof controlledMarkdown === 'string') return controlledMarkdown;
    return '';
  }, [controlledMarkdown, initialValue]);

  const [internalValue, setInternalValue] = useState<string>(() => computeInitialValue());
  const [savedValue, setSavedValue] = useState<string>(() => computeInitialValue());
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const currentValue = isControlled
    ? (controlledMarkdown as string | undefined) ?? ''
    : internalValue;

  // Handle client-side only rendering (MDXEditor doesn't support SSR)
  useEffect(() => {
    setIsMounted(true);
    if (showLoadingState) {
      setIsLoading(false);
    }
  }, [showLoadingState]);

  // Expose editor methods via ref
  useImperativeHandle(ref, () => editorRef.current!);

  useEffect(() => {
    if (!isControlled && initialValue !== undefined && initialValue !== prevInitialValueRef.current) {
      setInternalValue(initialValue);
      setSavedValue(initialValue);
      setIsDirty(false);
      prevInitialValueRef.current = initialValue;
    }
  }, [initialValue, isControlled]);

  useEffect(() => {
    if (filePath !== prevFilePathRef.current) {
      const baseline = initialValue ?? currentValue;
      if (!isControlled && initialValue !== undefined) {
        setInternalValue(initialValue);
      }
      setSavedValue(baseline);
      setIsDirty(false);
      prevFilePathRef.current = filePath;
    }
  }, [currentValue, filePath, initialValue, isControlled]);

  useEffect(() => {
    const dirty = currentValue !== savedValue;
    setIsDirty((prev) => (prev === dirty ? prev : dirty));
  }, [currentValue, savedValue]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const updateSavedState = useCallback(
    (nextSavedValue: string) => {
      setSavedValue(nextSavedValue);
      setIsDirty(false);
    },
    []
  );

  const handleChange = useCallback(
    (value: string, initialMarkdownNormalize: boolean) => {
      const nextValue = value ?? '';
      if (!isControlled) {
        setInternalValue(nextValue);
      }
      const dirty = nextValue !== savedValue;
      setIsDirty((prev) => (prev === dirty ? prev : dirty));
      externalOnChange?.(value, initialMarkdownNormalize);
    },
    [externalOnChange, isControlled, savedValue]
  );

  const handleSave = useCallback(async () => {
    if (onSave) {
      try {
        const latestValue = editorRef.current?.getMarkdown() ?? currentValue;
        const result = onSave(latestValue, { filePath });
        if (result && typeof (result as Promise<void>).then === 'function') {
          await result;
        }
        updateSavedState(latestValue);
      } catch (error) {
        console.error('Failed to save editor contents', error);
      }
    }
  }, [onSave, currentValue, filePath, updateSavedState]);

  // Handle save shortcut
  useEffect(() => {
    if (!enableSaveShortcut || !onSave) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableSaveShortcut, handleSave, onSave]);

  const editorStyles = useMemo(() => {
    // Helper to convert hex to rgba
    const hexToRgba = (hex: string, alpha: number): string => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (result) {
        const r = parseInt(result[1], 16);
        const g = parseInt(result[2], 16);
        const b = parseInt(result[3], 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
      return hex;
    };

    const primaryColor = theme.colors.primary || '#0066cc';
    const textColor = theme.colors.text || '#1a1a1a';

    return {
      // Radix Accent Colors (computed from primary color with different opacities)
      // These are used by MDXEditor's internal UI components (toolbar, dialogs, etc.)
      '--accentBase': primaryColor,
      '--accentBgSubtle': hexToRgba(primaryColor, 0.05),
      '--accentBg': hexToRgba(primaryColor, 0.1),
      '--accentBgHover': hexToRgba(primaryColor, 0.15),
      '--accentBgActive': hexToRgba(primaryColor, 0.2),
      '--accentLine': hexToRgba(primaryColor, 0.3),
      '--accentBorder': hexToRgba(primaryColor, 0.4),
      '--accentBorderHover': hexToRgba(primaryColor, 0.5),
      '--accentSolid': primaryColor,
      '--accentSolidHover': primaryColor,
      '--accentText': primaryColor,
      '--accentTextContrast': theme.colors.background || '#ffffff',

      // Radix Base Colors (computed from background/text colors)
      // These are used by MDXEditor's internal UI components (toolbar, dialogs, etc.)
      '--baseBase': theme.colors.background || '#ffffff',
      '--baseBgSubtle': theme.colors.backgroundSecondary || '#fafafa',
      '--baseBg': theme.colors.background || '#ffffff',
      '--baseBgHover': theme.colors.backgroundSecondary || '#f5f5f5',
      '--baseBgActive': theme.colors.backgroundTertiary || theme.colors.backgroundSecondary || '#f0f0f0',
      '--baseLine': hexToRgba(textColor, 0.15),
      '--baseBorder': theme.colors.border || '#e0e0e0',
      '--baseBorderHover': hexToRgba(textColor, 0.3),
      '--baseSolid': textColor,
      '--baseSolidHover': textColor,
      '--baseText': textColor,
      '--baseTextContrast': theme.colors.background || '#ffffff',

      // Our custom variables for content styling (used in mdx-editor-theme.css)
      '--mdx-editor-bg': theme.colors.background || '#ffffff',
      '--mdx-editor-fg': textColor,
      '--mdx-editor-border': theme.colors.border || '#e0e0e0',
      '--mdx-editor-toolbar-bg': theme.colors.backgroundSecondary || '#f8f8f8',
      '--mdx-editor-code-bg': theme.colors.backgroundTertiary || theme.colors.backgroundSecondary || '#f5f5f5',
      '--mdx-editor-selection-bg': hexToRgba(primaryColor, 0.2),
      '--mdx-editor-link-color': primaryColor,
      '--mdx-editor-heading-color': textColor,
      '--mdx-editor-font-family': theme.fonts?.monospace || 'monospace',
      '--mdx-editor-font-size': `${theme.fontSizes?.[2] || 14}px`,

      ...containerStyle,
    } as React.CSSProperties;
  }, [theme, containerStyle]);

  if (!isMounted || isLoading) {
    const loading = loadingComponent || (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts?.body || 'system-ui',
        }}
      >
        Loading editor...
      </div>
    );
    return <div style={{ height: '100%', ...containerStyle }}>{loading}</div>;
  }

  return (
    <div
      className={`themed-mdx-editor ${containerClassName}`.trim()}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        fontFamily: theme.fonts?.body || 'system-ui',
        ...editorStyles,
      }}
    >
      <div style={{ flex: 1, overflow: 'auto' }}>
        <MDXEditor
          ref={editorRef}
          markdown={currentValue}
          onChange={handleChange}
          contentEditableClassName="mdx-editor-content"
          {...restEditorProps}
        />
      </div>
      {!hideStatusBar && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            backgroundColor: theme.colors.backgroundSecondary,
            color: theme.colors.text,
            fontFamily: theme.fonts?.monospace || 'monospace',
            fontSize: theme.fontSizes?.[1] || 12,
            borderTop: `1px solid ${theme.colors.border}`,
          }}
        >
          <div style={{ flex: 1 }}>
            {filePath && (
              <span
                style={{
                  color: theme.colors.textSecondary,
                  fontSize: theme.fontSizes?.[0] || 11,
                }}
              >
                {filePath}
              </span>
            )}
          </div>
          <div
            style={{
              padding: '2px 8px',
              borderRadius: 4,
              border: `1px solid ${isDirty ? theme.colors.warning : theme.colors.border}`,
              backgroundColor: isDirty
                ? theme.colors.backgroundTertiary || theme.colors.backgroundSecondary
                : theme.colors.background,
              color: isDirty ? theme.colors.warning : theme.colors.textSecondary,
              fontWeight: 600,
              fontSize: theme.fontSizes?.[0] || 11,
            }}
          >
            {isDirty ? 'Modified' : 'Saved'}
          </div>
        </div>
      )}
    </div>
  );
});

ThemedMDXEditor.displayName = 'ThemedMDXEditor';
