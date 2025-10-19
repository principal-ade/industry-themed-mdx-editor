import { useTheme } from '@a24z/industry-theme';
import React from 'react';
import { ThemedMDXEditor, type ThemedMDXEditorProps } from './ThemedMDXEditor';

export type ThemedMDXEditorWithProviderProps = Omit<ThemedMDXEditorProps, 'theme'>;

/**
 * A MDXEditor component that automatically uses the theme from context
 * Use this when you already have a ThemeProvider wrapping your app
 */
export const ThemedMDXEditorWithProvider = React.forwardRef<
  React.ElementRef<typeof ThemedMDXEditor>,
  ThemedMDXEditorWithProviderProps
>((props, ref) => {
  const { theme } = useTheme();
  return <ThemedMDXEditor ref={ref} theme={theme} {...props} />;
});

ThemedMDXEditorWithProvider.displayName = 'ThemedMDXEditorWithProvider';
