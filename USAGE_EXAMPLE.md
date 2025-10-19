# Usage Example

This file shows how to integrate the `industry-themed-mdx-editor` into your Electron app.

## Update your existing MDXEditorPanel component

Replace the existing implementation in `/Users/griever/Developer/electron-app/src/renderer/panels/components/MDXEditorPanel.tsx` with the new themed version:

```tsx
import React, { useCallback } from 'react';
import { ThemedMDXEditor, createAutoCodeMirrorTheme } from '@principal-ade/industry-themed-mdx-editor';
import '@mdxeditor/editor/style.css';
import '@principal-ade/industry-themed-mdx-editor/styles.css';
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
import { useTheme } from '@a24z/industry-theme';
import { useRepositoryPanelContext } from '../RepositoryPanelProvider';
import { FileSystemService } from '../../main-process-api/FileSystemService';

interface MDXEditorPanelProps {
  filePath?: string | null;
  initialContent?: string;
  onSave?: (content: string) => void;
  readOnly?: boolean;
  variant?: 'panel' | 'tab';
}

export const MDXEditorPanel: React.FC<MDXEditorPanelProps> = ({
  filePath,
  initialContent = '# Welcome to MDXEditor\n\nStart editing your markdown content here...',
  onSave,
  readOnly = false,
  variant = 'panel',
}) => {
  const { theme } = useTheme();
  const { repositoryPath } = useRepositoryPanelContext();
  const [markdown, setMarkdown] = React.useState(initialContent);
  const [currentFilePath, setCurrentFilePath] = React.useState<string | null>(null);

  // Load file content when filePath changes
  React.useEffect(() => {
    const loadFileContent = async () => {
      if (!filePath || !repositoryPath || filePath === currentFilePath) return;

      try {
        const fullPath = filePath.startsWith('/')
          ? filePath
          : `${repositoryPath}/${filePath}`;
        const result = await FileSystemService.readFile(fullPath);

        let markdownContent = '';
        if (result && typeof result === 'object' && 'content' in result) {
          markdownContent = String(result.content || '');
        } else if (typeof result === 'string') {
          markdownContent = result;
        } else {
          markdownContent = String(result || '');
        }

        setMarkdown(markdownContent);
        setCurrentFilePath(filePath);
      } catch (error) {
        console.error('Error loading file:', error);
        setMarkdown('# Error Loading File\n\nFailed to load the requested file.');
      }
    };

    loadFileContent();
  }, [filePath, repositoryPath, currentFilePath]);

  const handleSave = useCallback(
    async (content: string, context: { filePath?: string }) => {
      if (onSave) {
        onSave(content);
      }

      if (currentFilePath && repositoryPath) {
        try {
          const fullPath = currentFilePath.startsWith('/')
            ? currentFilePath
            : `${repositoryPath}/${currentFilePath}`;
          const result = await FileSystemService.writeFile(fullPath, content);

          if (result && typeof result === 'object' && 'success' in result) {
            if (!result.success) {
              const errorMsg = 'error' in result ? result.error : 'Unknown error';
              console.error('Error saving file:', errorMsg);
              alert(`Failed to save file: ${errorMsg}`);
            }
          }
        } catch (error) {
          console.error('Error saving file:', error);
          alert(`Failed to save file: ${error}`);
        }
      }
    },
    [onSave, currentFilePath, repositoryPath]
  );

  return (
    <ThemedMDXEditor
      theme={theme}
      initialValue={markdown}
      filePath={filePath || undefined}
      onSave={handleSave}
      readOnly={readOnly}
      hideStatusBar={variant === 'tab'}
      plugins={[
        // Core plugins
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),

        // Link and image plugins
        linkPlugin(),
        linkDialogPlugin(),
        imagePlugin({
          imageUploadHandler: async (file) => {
            console.log('Uploading image:', file.name);
            return '/placeholder-image.png';
          },
        }),

        // Table plugin
        tablePlugin(),

        // Code block plugins with theming
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
          // Add themed CodeMirror extensions for proper code block theming
          codeMirrorExtensions: [createAutoCodeMirrorTheme(theme)],
        }),

        // Frontmatter plugin
        frontmatterPlugin(),

        // Source diff plugin
        diffSourcePlugin({ viewMode: 'rich-text' }),

        // Toolbar plugin
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
      ]}
    />
  );
};
```

## Installation in your Electron app

1. Install the package:
```bash
cd /Users/griever/Developer/electron-app
npm install @principal-ade/industry-themed-mdx-editor
# or
bun add @principal-ade/industry-themed-mdx-editor
```

2. Import the CSS in your app:
```tsx
import '@mdxeditor/editor/style.css';
import '@principal-ade/industry-themed-mdx-editor/styles.css';
```

3. Use the `ThemedMDXEditor` component with your existing theme context.

## Benefits of this approach

- **Externalized maintenance**: The MDX editor theming logic is now in its own package
- **Consistent theming**: Automatically syncs with your industry-theme
- **Reusable**: Can be used across multiple projects
- **Type-safe**: Full TypeScript support
- **Save functionality**: Built-in save handling with dirty state tracking
- **Flexible**: Supports both controlled and uncontrolled modes

## CodeMirror Theming (NEW!)

For proper code block theming that matches your industry-theme, you have three options:

### Option 1: Use the hook (recommended for components)

```tsx
import { useThemedMDXEditor } from '@principal-ade/industry-themed-mdx-editor';

function MyEditor() {
  const { getCodeMirrorExtensions } = useThemedMDXEditor();

  return (
    <ThemedMDXEditorWithProvider
      plugins={[
        // ... other plugins
        codeMirrorPlugin({
          codeBlockLanguages: { /* ... */ },
          codeMirrorExtensions: getCodeMirrorExtensions(),
        }),
      ]}
    />
  );
}
```

### Option 2: Use the utility function directly

```tsx
import { createAutoCodeMirrorTheme } from '@principal-ade/industry-themed-mdx-editor';
import { useTheme } from '@a24z/industry-theme';

function MyEditor() {
  const { theme } = useTheme();

  return (
    <ThemedMDXEditor
      theme={theme}
      plugins={[
        // ... other plugins
        codeMirrorPlugin({
          codeBlockLanguages: { /* ... */ },
          codeMirrorExtensions: [createAutoCodeMirrorTheme(theme)],
        }),
      ]}
    />
  );
}
```

### Option 3: Manual theme creation (for advanced customization)

```tsx
import { createCodeMirrorTheme } from '@principal-ade/industry-themed-mdx-editor';
import { useTheme } from '@a24z/industry-theme';

function MyEditor() {
  const { theme } = useTheme();

  // createCodeMirrorTheme gives you more control over the dark mode setting
  const cmTheme = createCodeMirrorTheme(theme);

  return (
    <ThemedMDXEditor
      theme={theme}
      plugins={[
        codeMirrorPlugin({
          codeBlockLanguages: { /* ... */ },
          codeMirrorExtensions: [cmTheme],
        }),
      ]}
    />
  );
}
```

**Note**: The `createAutoCodeMirrorTheme` function automatically detects if your theme is dark or light based on the background color luminance.
