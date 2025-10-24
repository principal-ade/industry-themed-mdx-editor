# @principal-ade/industry-themed-mdx-editor

Industry-themed MDX editor wrapper with integrated theming support for `@mdxeditor/editor`.

## Features

- Seamless integration with `@a24z/industry-theme`
- Automatic theme synchronization with MDXEditor
- Built-in save functionality with dirty state tracking
- Support for controlled and uncontrolled modes
- TypeScript support with full type definitions
- Custom CSS theming via CSS custom properties
- Optional status bar with save indicators
- File path tracking for context-aware operations

## Installation

```bash
npm install @principal-ade/industry-themed-mdx-editor @mdxeditor/editor @a24z/industry-theme
```

or with bun:

```bash
bun add @principal-ade/industry-themed-mdx-editor @mdxeditor/editor @a24z/industry-theme
```

## Tailwind CSS Compatibility

This package is fully compatible with Tailwind CSS. The library includes built-in styles that restore default HTML rendering for editor content, which Tailwind's Preflight CSS reset normally removes.

**No additional configuration is required** - the package's CSS automatically handles:
- Heading sizes and font weights (h1-h6)
- List styles and indentation (ul/ol)
- Paragraph spacing
- Blockquote styling
- Table borders and padding
- Code block formatting
- Link underlines
- Bold/italic rendering
- Horizontal rule visibility

The styles are scoped to `.themed-mdx-editor` and won't affect the rest of your application.

## Usage

### Basic Usage with Theme Provider

```tsx
import { ThemedMDXEditorWithProvider } from '@principal-ade/industry-themed-mdx-editor';
import '@mdxeditor/editor/style.css';
import '@principal-ade/industry-themed-mdx-editor/styles.css';

function App() {
  return (
    <ThemedMDXEditorWithProvider
      markdown="# Hello World"
      onChange={(value) => console.log(value)}
      plugins={[
        // Add your MDXEditor plugins here
      ]}
    />
  );
}
```

### Usage with Explicit Theme

```tsx
import { ThemedMDXEditor } from '@principal-ade/industry-themed-mdx-editor';
import { useTheme } from '@a24z/industry-theme';
import '@mdxeditor/editor/style.css';
import '@principal-ade/industry-themed-mdx-editor/styles.css';

function Editor() {
  const { theme } = useTheme();

  return (
    <ThemedMDXEditor
      theme={theme}
      markdown="# Hello World"
      onChange={(value) => console.log(value)}
      plugins={[
        // Add your MDXEditor plugins here
      ]}
    />
  );
}
```

### With Save Functionality

```tsx
import { ThemedMDXEditor } from '@principal-ade/industry-themed-mdx-editor';
import { useTheme } from '@a24z/industry-theme';
import {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  markdownShortcutPlugin,
} from '@mdxeditor/editor';

function Editor() {
  const { theme } = useTheme();

  const handleSave = async (content: string, context: { filePath?: string }) => {
    console.log('Saving content:', content);
    console.log('File path:', context.filePath);
    // Perform save operation
    await fetch('/api/save', {
      method: 'POST',
      body: JSON.stringify({ content, filePath: context.filePath }),
    });
  };

  return (
    <ThemedMDXEditor
      theme={theme}
      initialValue="# Hello World"
      filePath="/docs/example.md"
      onSave={handleSave}
      enableSaveShortcut={true}
      onDirtyChange={(isDirty) => console.log('Dirty:', isDirty)}
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        markdownShortcutPlugin(),
      ]}
    />
  );
}
```

### Using the Hook

```tsx
import { useThemedMDXEditor } from '@principal-ade/industry-themed-mdx-editor';

function CustomComponent() {
  const { theme, getCSSVariables } = useThemedMDXEditor();

  return (
    <div style={getCSSVariables()}>
      {/* Your custom MDX editor UI */}
    </div>
  );
}
```

## API

### ThemedMDXEditor Props

Extends all `MDXEditorProps` from `@mdxeditor/editor` with additional props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `theme` | `Theme` | Required | Industry theme object |
| `loadingComponent` | `React.ReactNode` | - | Custom loading component |
| `initialValue` | `string` | - | Initial content for uncontrolled mode |
| `onSave` | `(value: string, context: { filePath?: string }) => void \| Promise<void>` | - | Save callback |
| `filePath` | `string` | - | File path for context |
| `enableSaveShortcut` | `boolean` | `true` | Enable Ctrl/Cmd+S shortcut |
| `onDirtyChange` | `(isDirty: boolean) => void` | - | Dirty state callback |
| `hideStatusBar` | `boolean` | `false` | Hide status bar |
| `containerClassName` | `string` | - | Additional CSS classes |
| `containerStyle` | `React.CSSProperties` | - | Additional styles |
| `showLoadingState` | `boolean` | `false` | Show initial loading state |

### ThemedMDXEditorWithProvider Props

Same as `ThemedMDXEditor` but without the `theme` prop (uses theme from context).

Additional props:
- `themeName?: string` - Optional theme name to override current theme

### useThemedMDXEditor Hook

Returns:
- `theme` - Processed theme object with editor-specific values
- `getCSSVariables()` - Function that returns CSS custom properties object

## CSS Custom Properties

The package uses CSS custom properties for theming:

- `--mdx-editor-bg` - Background color
- `--mdx-editor-fg` - Foreground (text) color
- `--mdx-editor-border` - Border color
- `--mdx-editor-toolbar-bg` - Toolbar background
- `--mdx-editor-font-family` - Font family
- `--mdx-editor-font-size` - Font size
- `--mdx-editor-code-bg` - Code block background
- `--mdx-editor-selection-bg` - Selection background
- `--mdx-editor-link-color` - Link color
- `--mdx-editor-heading-color` - Heading color

## License

MIT © Principal ADE Team
