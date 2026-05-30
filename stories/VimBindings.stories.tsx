import type { Meta, StoryObj } from '@storybook/react';
import { ThemedMDXEditorWithProvider } from '../src/components/ThemedMDXEditorWithProvider';
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
} from '@principal-ai/mdx-editor';
// Vim primitives are part of this package's public API (see index.ts).
import {
  useVimCompartment,
  vimExtension,
  VimToggle,
  ViewModeReporter,
  type ViewMode,
} from '../index';
import React from 'react';
import { useThemedMDXEditor } from '../src/hooks/useThemedMDXEditor';

/**
 * Vim Bindings
 * ============
 *
 * `@principal-ai/mdx-editor` has no built-in vim setting, but the source/raw
 * markdown view and code blocks are rendered with CodeMirror 6, which expose a
 * `codeMirrorExtensions` escape hatch. This package wires `vim()` into those
 * surfaces and exposes reusable primitives (`useVimCompartment`, `vimExtension`,
 * `VimToggle`, `ViewModeReporter`) so a host app can enable vim, toggle it at
 * runtime, and persist/restore the user's choice.
 *
 * Persisting state for the host app:
 * - **Vim on/off** — `VimToggle`'s `onChange(enabled)` fires on every toggle;
 *   seed the next mount via `vimExtension(compartment, savedEnabled)`.
 * - **View mode** — `ViewModeReporter`'s `onChange(mode)` fires whenever the
 *   user switches rich-text / source / diff; seed the next mount via
 *   `diffSourcePlugin({ viewMode: savedMode })`.
 *
 * See the `PersistedState` story for a full localStorage round-trip.
 */

const sampleMarkdown = `# Vim Bindings Demo

This editor has **vim keybindings** wired into its CodeMirror surfaces, plus a
toggle button in the toolbar (look for **"Vim: On"** on the right).

## Try it out

The editor opens in **source** mode so you can test vim immediately:

- Press \`i\` to enter insert mode, \`Esc\` to go back to normal mode
- Try motions: \`w\`, \`b\`, \`0\`, \`$\`, \`gg\`, \`G\`
- Try operators: \`dd\` (delete line), \`yy\` (yank), \`p\` (paste), \`cw\` (change word)
- Try ex commands: \`:%s/vim/VIM/g\`
- Click **Vim: On / Vim: Off** in the toolbar to toggle bindings live

## Code blocks are vim-enabled too

\`\`\`typescript
function greet(name: string): string {
  // Put your cursor here and try vim motions
  return \`Hello, \${name}!\`;
}
\`\`\`

> Toggle between rich-text and source with the toolbar button on the right.
> Vim bindings are active in source mode and inside code blocks.
`;

const codeBlockLanguages = {
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
  mermaid: 'Mermaid',
};

interface VimPluginOptions {
  defaultVimEnabled: boolean;
  defaultViewMode: ViewMode;
  onVimEnabledChange?: (enabled: boolean) => void;
  onViewModeChange?: (mode: ViewMode) => void;
}

/**
 * Builds the plugin list with vim wired into the CodeMirror surfaces via the
 * package's vim primitives, and surfaces vim/view-mode changes to the host.
 */
function useVimPlugins({
  defaultVimEnabled,
  defaultViewMode,
  onVimEnabledChange,
  onViewModeChange,
}: VimPluginOptions) {
  const { getCodeMirrorExtensions } = useThemedMDXEditor();
  // One stable compartment per editor instance, shared between the CodeMirror
  // extensions and the toolbar toggle button.
  const vimCompartment = useVimCompartment();

  return React.useMemo(() => {
    // vimExtension() goes first so the vim keymap wins over default keymaps.
    const cmExtensions = [
      vimExtension(vimCompartment, defaultVimEnabled),
      ...getCodeMirrorExtensions(),
    ];

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
      codeBlockPlugin({ defaultCodeBlockLanguage: '' }),
      // Vim inside fenced code blocks.
      codeMirrorPlugin({
        codeBlockLanguages,
        codeMirrorExtensions: cmExtensions,
      }),
      frontmatterPlugin(),
      // Vim inside the source / raw markdown view. The host-supplied
      // `defaultViewMode` restores the last view the user was in.
      diffSourcePlugin({
        viewMode: defaultViewMode,
        codeMirrorExtensions: cmExtensions,
      }),
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
            {/* Headless: notifies the host whenever the view mode changes. */}
            <ViewModeReporter onChange={onViewModeChange} />
            {/* Rendered OUTSIDE DiffSourceToggleWrapper (which hides its
                children in source/diff mode); VimToggle hides itself in
                rich-text mode on its own. */}
            <VimToggle
              compartment={vimCompartment}
              defaultEnabled={defaultVimEnabled}
              onChange={onVimEnabledChange}
            />
          </>
        ),
      }),
    ];
  }, [
    getCodeMirrorExtensions,
    vimCompartment,
    defaultVimEnabled,
    defaultViewMode,
    onVimEnabledChange,
    onViewModeChange,
  ]);
}

interface VimEditorProps
  extends React.ComponentProps<typeof ThemedMDXEditorWithProvider> {
  defaultVimEnabled?: boolean;
  defaultViewMode?: ViewMode;
  onVimEnabledChange?: (enabled: boolean) => void;
  onViewModeChange?: (mode: ViewMode) => void;
}

function VimEditor({
  defaultVimEnabled = true,
  defaultViewMode = 'source',
  onVimEnabledChange,
  onViewModeChange,
  ...props
}: VimEditorProps) {
  const plugins = useVimPlugins({
    defaultVimEnabled,
    defaultViewMode,
    onVimEnabledChange,
    onViewModeChange,
  });
  return <ThemedMDXEditorWithProvider {...props} plugins={plugins} />;
}

const meta = {
  title: 'Components/VimBindings',
  component: VimEditor,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Vim keybindings wired into the CodeMirror surfaces (source/raw view and code blocks) ' +
          'via the package vim primitives. A toolbar button toggles vim at runtime using a ' +
          'CodeMirror `Compartment`; `VimToggle.onChange` and `ViewModeReporter.onChange` let a ' +
          'host app persist and restore the choices. The rich-text (WYSIWYG) mode is Lexical-based ' +
          'and is not affected by vim.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    defaultVimEnabled: {
      control: 'boolean',
      description: 'Initial vim state when the editor mounts (toggle live in the toolbar)',
    },
    defaultViewMode: {
      control: 'select',
      options: ['rich-text', 'source', 'diff'],
      description: 'Initial view mode when the editor mounts',
    },
  },
  args: {
    defaultVimEnabled: true,
    defaultViewMode: 'source',
  },
} satisfies Meta<typeof VimEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Vim enabled by default, opens in source mode. Use the **Vim: On / Vim: Off**
 * button in the toolbar to toggle bindings live, with cursor + undo preserved.
 */
export const VimEnabled: Story = {
  args: {
    markdown: sampleMarkdown,
    defaultVimEnabled: true,
  },
};

/**
 * Same editor, but vim starts **off** — click the toolbar button to turn it on.
 */
export const VimDisabled: Story = {
  args: {
    markdown: sampleMarkdown,
    defaultVimEnabled: false,
  },
};

/**
 * PersistedState
 * --------------
 * Demonstrates the integration contract a host app (e.g.
 * `industry-themed-file-editing-panels`) would use: persist vim on/off and the
 * view mode whenever they change, then re-seed the editor with those values on
 * the next mount.
 *
 * Toggle vim and switch view modes, then click **Remount editor** (or reload):
 * the editor comes back in the same view mode with the same vim state, read
 * back from `localStorage`.
 */
const STORAGE_KEY = 'industry-mdx-editor.vim-demo.prefs';

interface Prefs {
  vimEnabled: boolean;
  viewMode: ViewMode;
}

function loadPrefs(): Prefs {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Prefs>;
      return {
        vimEnabled: parsed.vimEnabled ?? true,
        viewMode: parsed.viewMode ?? 'source',
      };
    }
  } catch {
    // ignore malformed/unavailable storage
  }
  return { vimEnabled: true, viewMode: 'source' };
}

function savePrefs(prefs: Prefs) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore unavailable storage
  }
}

const PersistedDemo = () => {
  // Read persisted prefs once, to seed the initial mount.
  const initial = React.useRef<Prefs>(loadPrefs()).current;
  const [prefs, setPrefs] = React.useState<Prefs>(initial);
  // Bump to force a fresh editor mount that re-reads the seed values.
  const [mountKey, setMountKey] = React.useState(0);
  const seedRef = React.useRef<Prefs>(initial);

  const onVimEnabledChange = React.useCallback((vimEnabled: boolean) => {
    setPrefs((prev) => {
      const next = { ...prev, vimEnabled };
      savePrefs(next);
      seedRef.current = next;
      return next;
    });
  }, []);

  const onViewModeChange = React.useCallback((viewMode: ViewMode) => {
    setPrefs((prev) => {
      const next = { ...prev, viewMode };
      savePrefs(next);
      seedRef.current = next;
      return next;
    });
  }, []);

  const remount = React.useCallback(() => {
    setPrefs(seedRef.current);
    setMountKey((k) => k + 1);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '10px 16px',
          borderBottom: '1px solid var(--baseBorder, #ddd)',
          fontFamily: 'monospace',
          fontSize: 13,
        }}
      >
        <strong>Persisted prefs:</strong>
        <span>
          vim=<code>{String(prefs.vimEnabled)}</code>
        </span>
        <span>
          viewMode=<code>{prefs.viewMode}</code>
        </span>
        <button
          type="button"
          onClick={remount}
          style={{
            marginLeft: 'auto',
            padding: '4px 12px',
            borderRadius: 4,
            cursor: 'pointer',
            border: '1px solid var(--baseBorder, #ccc)',
          }}
        >
          Remount editor
        </button>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <VimEditor
          key={mountKey}
          markdown={sampleMarkdown}
          defaultVimEnabled={seedRef.current.vimEnabled}
          defaultViewMode={seedRef.current.viewMode}
          onVimEnabledChange={onVimEnabledChange}
          onViewModeChange={onViewModeChange}
          containerStyle={{ height: '100%' }}
        />
      </div>
    </div>
  );
};

export const PersistedState: StoryObj = {
  render: () => <PersistedDemo />,
  parameters: { layout: 'fullscreen' },
};
