import { useTheme } from '@a24z/industry-theme';
import { useCallback, useMemo } from 'react';

/**
 * Hook that provides MDX editor theme configuration from industry-theme
 * Use this when you need to access theme values for custom MDX editor plugins or configuration
 */
export function useThemedMDXEditor() {
  const { theme } = useTheme();

  const editorTheme = useMemo(
    () => ({
      colors: {
        background: theme.colors.background,
        text: theme.colors.text,
        textSecondary: theme.colors.textSecondary,
        backgroundSecondary: theme.colors.backgroundSecondary,
        backgroundTertiary: theme.colors.backgroundTertiary || theme.colors.backgroundSecondary,
        border: theme.colors.border,
        primary: theme.colors.primary,
        warning: theme.colors.warning,
        highlight: theme.colors.highlight,
      },
      fonts: {
        body: theme.fonts?.body || 'system-ui',
        monospace: theme.fonts?.monospace || 'monospace',
      },
      fontSizes: {
        small: theme.fontSizes?.[0] || 11,
        normal: theme.fontSizes?.[1] || 12,
        medium: theme.fontSizes?.[2] || 14,
        large: theme.fontSizes?.[3] || 16,
      },
    }),
    [theme]
  );

  const getCSSVariables = useCallback(() => {
    return {
      '--mdx-editor-bg': editorTheme.colors.background,
      '--mdx-editor-fg': editorTheme.colors.text,
      '--mdx-editor-border': editorTheme.colors.border,
      '--mdx-editor-toolbar-bg': editorTheme.colors.backgroundSecondary,
      '--mdx-editor-font-family': editorTheme.fonts.monospace,
      '--mdx-editor-font-size': `${editorTheme.fontSizes.medium}px`,
      '--mdx-editor-code-bg': editorTheme.colors.backgroundTertiary,
      '--mdx-editor-selection-bg': editorTheme.colors.highlight,
      '--mdx-editor-link-color': editorTheme.colors.primary,
      '--mdx-editor-heading-color': editorTheme.colors.text,
    } as Record<string, string>;
  }, [editorTheme]);

  return {
    theme: editorTheme,
    getCSSVariables,
  };
}
