/**
 * @principal-ade/industry-themed-mdx-editor
 *
 * A MDXEditor wrapper that integrates with @a24z/industry-theme
 */

// Main components
export { ThemedMDXEditor } from './src/components/ThemedMDXEditor';
export type { ThemedMDXEditorProps } from './src/components/ThemedMDXEditor';

export { ThemedMDXEditorWithProvider } from './src/components/ThemedMDXEditorWithProvider';
export type { ThemedMDXEditorWithProviderProps } from './src/components/ThemedMDXEditorWithProvider';

// Hooks
export { useThemedMDXEditor } from './src/hooks/useThemedMDXEditor';

// Re-export types from @a24z/industry-theme for convenience
export type { Theme } from '@a24z/industry-theme';

// Re-export MDXEditor types for convenience
export type { MDXEditorMethods, MDXEditorProps } from '@mdxeditor/editor';
