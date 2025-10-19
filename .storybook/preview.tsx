import React from 'react';
import type { Preview } from '@storybook/react';
import { ThemeProvider } from '@a24z/industry-theme';
import '@mdxeditor/editor/style.css';
import '../src/styles/mdx-editor-theme.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ height: '600px', padding: '20px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default preview;
