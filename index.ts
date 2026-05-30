/**
 * @principal-ade/industry-themed-mdx-editor
 *
 * A MDXEditor wrapper that integrates with @principal-ade/industry-theme
 */

// Main components
export { ThemedMDXEditor } from './src/components/ThemedMDXEditor';
export type { ThemedMDXEditorProps, DocumentPadding } from './src/components/ThemedMDXEditor';

export { ThemedMDXEditorWithProvider } from './src/components/ThemedMDXEditorWithProvider';
export type { ThemedMDXEditorWithProviderProps } from './src/components/ThemedMDXEditorWithProvider';

// Hooks
export { useThemedMDXEditor } from './src/hooks/useThemedMDXEditor';

// Vim bindings for the CodeMirror surfaces (source view + code blocks),
// with runtime toggle + view-mode/vim change notifications for persistence.
export {
  useVimCompartment,
  vimExtension,
  setVimEnabled,
  VimToggle,
  ViewModeReporter,
  viewMode$,
} from './src/vim';
export type {
  VimToggleProps,
  ViewModeReporterProps,
  ViewMode,
} from './src/vim';

// Utilities
export { createCodeMirrorTheme, createAutoCodeMirrorTheme } from './src/utils/codeMirrorTheme';

// Re-export types from @principal-ade/industry-theme for convenience
export type { Theme } from '@principal-ade/industry-theme';

// Re-export MDXEditor types for convenience
export type { MDXEditorMethods, MDXEditorProps } from '@principal-ai/mdx-editor';
