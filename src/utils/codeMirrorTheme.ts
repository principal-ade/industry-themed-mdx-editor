import type { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import type { Theme } from '@a24z/industry-theme';

/**
 * Creates a CodeMirror theme extension based on an industry-theme Theme object
 * This ensures code blocks in the editor match the overall theme
 */
export function createCodeMirrorTheme(theme: Theme): Extension {
  const bgColor = theme.colors.backgroundTertiary || theme.colors.backgroundSecondary || '#f5f5f5';
  const textColor = theme.colors.text || '#1a1a1a';
  const borderColor = theme.colors.border || '#e0e0e0';
  const selectionBg = theme.colors.highlight || 'rgba(0, 102, 204, 0.2)';
  const activeLine = theme.colors.backgroundSecondary || '#f0f0f0';
  const fontFamily = theme.fonts?.monospace || 'monospace';

  return EditorView.theme(
    {
      '&': {
        backgroundColor: bgColor,
        color: textColor,
        fontFamily,
      },
      '.cm-content': {
        caretColor: textColor,
        fontFamily,
      },
      '.cm-scroller': {
        fontFamily,
      },
      '&.cm-focused .cm-cursor': {
        borderLeftColor: textColor,
      },
      '&.cm-focused .cm-selectionBackground, ::selection': {
        backgroundColor: selectionBg,
      },
      '.cm-selectionBackground': {
        backgroundColor: selectionBg,
      },
      '.cm-gutters': {
        backgroundColor: bgColor,
        color: textColor,
        border: 'none',
        borderRight: `1px solid ${borderColor}`,
      },
      '.cm-activeLineGutter': {
        backgroundColor: activeLine,
      },
      '.cm-activeLine': {
        backgroundColor: activeLine,
      },
      '.cm-lineNumbers .cm-gutterElement': {
        color: theme.colors.textSecondary || textColor,
        padding: '0 8px 0 8px',
      },
      '.cm-foldGutter .cm-gutterElement': {
        color: theme.colors.textSecondary || textColor,
      },
    },
    { dark: false } // Set to true if you want dark theme support
  );
}

/**
 * Helper to determine if a theme is dark based on its background color
 */
function isDarkTheme(theme: Theme): boolean {
  const bg = theme.colors.background || '#ffffff';
  // Simple heuristic: check if background is dark
  const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(bg);
  if (rgb) {
    const r = parseInt(rgb[1], 16);
    const g = parseInt(rgb[2], 16);
    const b = parseInt(rgb[3], 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  }
  return false;
}

/**
 * Creates a CodeMirror theme extension with automatic dark mode detection
 */
export function createAutoCodeMirrorTheme(theme: Theme): Extension {
  const bgColor = theme.colors.backgroundTertiary || theme.colors.backgroundSecondary || '#f5f5f5';
  const textColor = theme.colors.text || '#1a1a1a';
  const borderColor = theme.colors.border || '#e0e0e0';
  const selectionBg = theme.colors.highlight || 'rgba(0, 102, 204, 0.2)';
  const activeLine = theme.colors.backgroundSecondary || '#f0f0f0';
  const fontFamily = theme.fonts?.monospace || 'monospace';
  const dark = isDarkTheme(theme);

  return EditorView.theme(
    {
      '&': {
        backgroundColor: bgColor,
        color: textColor,
        fontFamily,
      },
      '.cm-content': {
        caretColor: textColor,
        fontFamily,
      },
      '.cm-scroller': {
        fontFamily,
      },
      '&.cm-focused .cm-cursor': {
        borderLeftColor: textColor,
      },
      '&.cm-focused .cm-selectionBackground, ::selection': {
        backgroundColor: selectionBg,
      },
      '.cm-selectionBackground': {
        backgroundColor: selectionBg,
      },
      '.cm-gutters': {
        backgroundColor: bgColor,
        color: textColor,
        border: 'none',
        borderRight: `1px solid ${borderColor}`,
      },
      '.cm-activeLineGutter': {
        backgroundColor: activeLine,
      },
      '.cm-activeLine': {
        backgroundColor: activeLine,
      },
      '.cm-lineNumbers .cm-gutterElement': {
        color: theme.colors.textSecondary || textColor,
        padding: '0 8px 0 8px',
      },
      '.cm-foldGutter .cm-gutterElement': {
        color: theme.colors.textSecondary || textColor,
      },
    },
    { dark }
  );
}
