/**
 * @principal-ade/industry-themed-mdx-editor
 *
 * A MDXEditor wrapper that integrates with @a24z/industry-theme
 */

// Main components
export { ThemedMDXEditor } from './src/components/ThemedMDXEditor';
export type { ThemedMDXEditorProps, DocumentPadding } from './src/components/ThemedMDXEditor';

export { ThemedMDXEditorWithProvider } from './src/components/ThemedMDXEditorWithProvider';
export type { ThemedMDXEditorWithProviderProps } from './src/components/ThemedMDXEditorWithProvider';

// Hooks
export { useThemedMDXEditor } from './src/hooks/useThemedMDXEditor';

// Utilities
export { createCodeMirrorTheme, createAutoCodeMirrorTheme } from './src/utils/codeMirrorTheme';

// MDX Auto-Fix Plugin
export {
  preprocessMDX,
  defaultPreprocessRules,
  mdxAutoFix,
  lessThanDigitTransformer,
  greaterThanDigitTransformer,
  invalidTagNamesTransformer,
  defaultTransformers,
  allTransformers,
} from './src/plugins/mdx-auto-fix';

export type {
  PreprocessRule,
  MDXAutoFixOptions,
  Transformer,
  TransformerContext,
  TransformerStats,
  TransformerTestCase,
} from './src/plugins/mdx-auto-fix';

// Re-export types from @a24z/industry-theme for convenience
export type { Theme } from '@a24z/industry-theme';

// Re-export MDXEditor types for convenience
export type { MDXEditorMethods, MDXEditorProps } from '@mdxeditor/editor';
