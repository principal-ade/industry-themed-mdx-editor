import type { Meta, StoryObj } from '@storybook/react';
import { ThemedMDXEditorWithProvider } from '../src/components/ThemedMDXEditorWithProvider';
import { ThemeProvider } from '@a24z/industry-theme';
import {
  defaultMarkdownTheme,
  defaultTerminalTheme,
  defaultEditorTheme,
} from '@a24z/industry-theme';
import {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  frontmatterPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  BlockTypeSelect,
  DiffSourceToggleWrapper,
} from '@mdxeditor/editor';
import React from 'react';
import { useThemedMDXEditor } from '../src/hooks/useThemedMDXEditor';

const sampleMarkdown = `# Welcome to Industry-Themed MDX Editor

This is a **themed** MDX editor that integrates with the industry-theme system.

## Features

- 🎨 Automatic theme synchronization
- 💾 Built-in save functionality with Ctrl/Cmd+S
- 📝 Full MDX support with plugins
- 🔧 Customizable via CSS custom properties
- 📊 Status bar with file path and dirty state

### Code Example

\`\`\`typescript
import { ThemedMDXEditor } from '@principal-ade/industry-themed-mdx-editor';

function MyEditor() {
  return (
    <ThemedMDXEditor
      theme={theme}
      initialValue="# Hello World"
      onSave={handleSave}
    />
  );
}
\`\`\`

### Lists

1. First item
2. Second item
3. Third item

- Bullet point
- Another point
  - Nested point

### Blockquote

> This is a blockquote with **formatting** and [links](https://example.com).

### Table

| Feature | Status |
|---------|--------|
| Theming | ✅ |
| Save | ✅ |
| Plugins | ✅ |

---

Try editing this content and use **Ctrl/Cmd+S** to save!
`;

/**
 * Helper component to create themed plugins
 * Uses the hook to get CodeMirror extensions
 */
function useDefaultPlugins() {
  const { getCodeMirrorExtensions } = useThemedMDXEditor();

  return React.useMemo(
    () => [
      headingsPlugin(),
      listsPlugin(),
      quotePlugin(),
      thematicBreakPlugin(),
      markdownShortcutPlugin(),
      linkPlugin(),
      linkDialogPlugin(),
      imagePlugin({
        imageUploadHandler: async () => 'https://via.placeholder.com/400x300',
      }),
      tablePlugin(),
      codeBlockPlugin({ defaultCodeBlockLanguage: 'javascript' }),
      codeMirrorPlugin({
        codeBlockLanguages: {
          javascript: 'JavaScript',
          typescript: 'TypeScript',
          python: 'Python',
          java: 'Java',
          go: 'Go',
          rust: 'Rust',
          cpp: 'C++',
          c: 'C',
          css: 'CSS',
          html: 'HTML',
          json: 'JSON',
          yaml: 'YAML',
          markdown: 'Markdown',
          bash: 'Bash',
          shell: 'Shell',
          sql: 'SQL',
        },
        codeMirrorExtensions: getCodeMirrorExtensions(),
      }),
      frontmatterPlugin(),
      diffSourcePlugin({ viewMode: 'rich-text' }),
      toolbarPlugin({
        toolbarContents: () => (
          <>
            <DiffSourceToggleWrapper>
              <UndoRedo />
              <BlockTypeSelect />
              <BoldItalicUnderlineToggles />
              <CodeToggle />
              <CreateLink />
              <InsertImage />
              <InsertTable />
              <InsertThematicBreak />
              <ListsToggle />
            </DiffSourceToggleWrapper>
          </>
        ),
      }),
    ],
    [getCodeMirrorExtensions]
  );
}

/**
 * Wrapper component to provide themed plugins to stories
 */
function ThemedEditor(props: React.ComponentProps<typeof ThemedMDXEditorWithProvider>) {
  const plugins = useDefaultPlugins();
  return <ThemedMDXEditorWithProvider {...props} plugins={props.plugins || plugins} />;
}

const meta = {
  title: 'Components/ThemedMDXEditor',
  component: ThemedEditor,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    readOnly: {
      control: 'boolean',
      description: 'Make the editor read-only',
    },
    hideStatusBar: {
      control: 'boolean',
      description: 'Hide the status bar',
    },
    enableSaveShortcut: {
      control: 'boolean',
      description: 'Enable Ctrl/Cmd+S save shortcut',
    },
  },
} satisfies Meta<typeof ThemedEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    markdown: sampleMarkdown,
    onChange: (value) => {
      console.log('Content changed:', value);
    },
  },
};

export const WithSave: Story = {
  args: {
    initialValue: sampleMarkdown,
    filePath: 'example.md',
    onSave: async (content, context) => {
      console.log('Saving content:', content);
      console.log('File path:', context.filePath);
      // Simulate async save
      await new Promise((resolve) => setTimeout(resolve, 500));
      alert(`Saved ${context.filePath}!`);
    },
    onDirtyChange: (isDirty) => {
      console.log('Dirty state:', isDirty);
    },
  },
};

export const ReadOnly: Story = {
  args: {
    markdown: sampleMarkdown,
    readOnly: true,
  },
};

export const MinimalPlugins: Story = {
  args: {
    markdown: '# Simple Editor\n\nThis editor has minimal plugins enabled.',
    plugins: [
      headingsPlugin(),
      listsPlugin(),
      quotePlugin(),
      markdownShortcutPlugin(),
    ],
  },
};

export const NoStatusBar: Story = {
  args: {
    markdown: sampleMarkdown,
    hideStatusBar: true,
  },
};

export const CustomHeight: Story = {
  args: {
    markdown: sampleMarkdown,
    containerStyle: {
      height: '400px',
    },
  },
};

export const EmptyState: Story = {
  args: {
    markdown: '',
    filePath: 'new-document.md',
  },
};

export const WithFrontmatter: Story = {
  args: {
    markdown: `---
title: My Document
author: Jane Doe
date: 2025-10-18
tags: [documentation, example]
---

# Document with Frontmatter

This document includes YAML frontmatter metadata.

The frontmatter plugin allows you to edit metadata in a structured way.
`,
  },
};

export const CodeFocused: Story = {
  args: {
    markdown: `# Code Examples

## TypeScript

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

function greetUser(user: User): string {
  return \`Hello, \${user.name}!\`;
}
\`\`\`

## Python

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print([fibonacci(i) for i in range(10)])
\`\`\`

## JavaScript

\`\`\`javascript
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' }
];

const names = users.map(u => u.name);
console.log(names);
\`\`\`
`,
  },
};

/**
 * Theme Selector Story - allows testing all available themes
 */
const ThemeSelector = () => {
  const [selectedTheme, setSelectedTheme] = React.useState<'markdown' | 'terminal' | 'editor'>('markdown');

  const themes = {
    markdown: defaultMarkdownTheme,
    terminal: defaultTerminalTheme,
    editor: defaultEditorTheme,
  };

  const currentTheme = themes[selectedTheme];

  const plugins = React.useMemo(() => {
    return [
      headingsPlugin(),
      listsPlugin(),
      quotePlugin(),
      thematicBreakPlugin(),
      markdownShortcutPlugin(),
      linkPlugin(),
      linkDialogPlugin(),
      imagePlugin({
        imageUploadHandler: async () => 'https://via.placeholder.com/400x300',
      }),
      tablePlugin(),
      codeBlockPlugin({ defaultCodeBlockLanguage: 'javascript' }),
      codeMirrorPlugin({
        codeBlockLanguages: {
          javascript: 'JavaScript',
          typescript: 'TypeScript',
          python: 'Python',
          java: 'Java',
          go: 'Go',
          rust: 'Rust',
          cpp: 'C++',
          c: 'C',
          css: 'CSS',
          html: 'HTML',
          json: 'JSON',
          yaml: 'YAML',
          markdown: 'Markdown',
          bash: 'Bash',
          shell: 'Shell',
          sql: 'SQL',
        },
      }),
      frontmatterPlugin(),
      diffSourcePlugin({ viewMode: 'rich-text' }),
      toolbarPlugin({
        toolbarContents: () => (
          <>
            <DiffSourceToggleWrapper>
              <UndoRedo />
              <BlockTypeSelect />
              <BoldItalicUnderlineToggles />
              <CodeToggle />
              <CreateLink />
              <InsertImage />
              <InsertTable />
              <InsertThematicBreak />
              <ListsToggle />
            </DiffSourceToggleWrapper>
          </>
        ),
      }),
    ];
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Theme Selector UI */}
      <div
        style={{
          padding: '16px',
          backgroundColor: currentTheme.colors.backgroundSecondary,
          borderBottom: `1px solid ${currentTheme.colors.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <span
          style={{
            fontFamily: currentTheme.fonts?.body,
            fontSize: '14px',
            fontWeight: 600,
            color: currentTheme.colors.text,
          }}
        >
          Select Theme:
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {Object.keys(themes).map((themeKey) => (
            <button
              key={themeKey}
              onClick={() => setSelectedTheme(themeKey as keyof typeof themes)}
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: `1px solid ${currentTheme.colors.border}`,
                backgroundColor:
                  selectedTheme === themeKey
                    ? currentTheme.colors.primary
                    : currentTheme.colors.background,
                color:
                  selectedTheme === themeKey
                    ? currentTheme.colors.background
                    : currentTheme.colors.text,
                fontFamily: currentTheme.fonts?.body,
                fontSize: '14px',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s',
              }}
            >
              {themeKey}
            </button>
          ))}
        </div>
        <div
          style={{
            marginLeft: 'auto',
            fontFamily: currentTheme.fonts?.monospace,
            fontSize: '12px',
            color: currentTheme.colors.textSecondary,
          }}
        >
          Current: <strong style={{ color: currentTheme.colors.primary }}>{selectedTheme}</strong>
        </div>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <ThemeProvider theme={currentTheme}>
          <ThemedMDXEditorWithProvider
            markdown={sampleMarkdown}
            plugins={plugins}
            filePath={`example-${selectedTheme}.md`}
            onSave={async (content, context) => {
              console.log('Saving content:', content);
              console.log('File path:', context.filePath);
              await new Promise((resolve) => setTimeout(resolve, 500));
              alert(`Saved ${context.filePath}!`);
            }}
            containerStyle={{ height: '100%' }}
          />
        </ThemeProvider>
      </div>
    </div>
  );
};

export const AllThemes: StoryObj = {
  render: () => <ThemeSelector />,
  parameters: {
    layout: 'fullscreen',
  },
};
