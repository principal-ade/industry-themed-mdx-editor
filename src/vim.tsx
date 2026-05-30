import { Compartment, type Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { vim } from '@replit/codemirror-vim';
import { viewMode$, type ViewMode } from '@principal-ai/mdx-editor';
import { useCellValue } from '@mdxeditor/gurx';
import React from 'react';

export type { ViewMode };
export { viewMode$ };

/**
 * Vim bindings for the CodeMirror surfaces of the MDX editor (the source/raw
 * markdown view and fenced code blocks). The rich-text (WYSIWYG / Lexical) mode
 * is NOT a CodeMirror surface, so vim does not apply there.
 *
 * Vim is wrapped in a CodeMirror `Compartment` so it can be toggled at runtime
 * without rebuilding the editor (cursor + undo history are preserved).
 *
 * Typical usage when assembling the editor's `plugins`:
 *
 *   const vimCompartment = useVimCompartment();
 *   const cmExtensions = [vimExtension(vimCompartment, vimEnabled), ...themeExt];
 *   // ...pass cmExtensions to codeMirrorPlugin() and diffSourcePlugin().
 *   // In toolbarContents, render:
 *   //   <VimToggle compartment={vimCompartment} defaultEnabled={vimEnabled}
 *   //              onChange={persistVimEnabled} />
 *   //   <ViewModeReporter onChange={persistViewMode} />
 */

/** A stable `Compartment` for one editor instance, shared between the extension and the toggle. */
export function useVimCompartment(): Compartment {
  return React.useRef(new Compartment()).current;
}

/**
 * The CodeMirror extension entry to include in a plugin's `codeMirrorExtensions`.
 * Place it first so the vim keymap takes precedence over the default keymaps.
 */
export function vimExtension(compartment: Compartment, enabled: boolean): Extension {
  return compartment.of(enabled ? vim() : []);
}

/**
 * Imperatively reconfigure the live CodeMirror view(s) within `root` to match
 * `enabled`. Scope `root` to a single editor (e.g. its `.mdxeditor` container)
 * when multiple editors share a page; defaults to the whole document.
 */
export function setVimEnabled(
  compartment: Compartment,
  enabled: boolean,
  root: ParentNode = document
): void {
  root.querySelectorAll<HTMLElement>('.cm-editor').forEach((dom) => {
    const view = EditorView.findFromDOM(dom);
    view?.dispatch({ effects: compartment.reconfigure(enabled ? vim() : []) });
  });
}

export interface ViewModeReporterProps {
  /** Called on mount and whenever the editor's view mode changes. */
  onChange?: (mode: ViewMode) => void;
}

/**
 * Headless component that reports the editor's current view mode
 * (`rich-text` | `source` | `diff`) whenever it changes. Render it inside the
 * editor (e.g. within `toolbarContents`) so it can read the editor's realm.
 */
export function ViewModeReporter({ onChange }: ViewModeReporterProps): React.ReactElement | null {
  const viewMode = useCellValue(viewMode$);
  const cb = React.useRef(onChange);
  cb.current = onChange;
  React.useEffect(() => {
    cb.current?.(viewMode);
  }, [viewMode]);
  return null;
}

export interface VimToggleProps {
  /** The compartment shared with {@link vimExtension}. */
  compartment: Compartment;
  /** Initial vim state when the editor mounts. Defaults to `true`. */
  defaultEnabled?: boolean;
  /** Called whenever the user toggles vim on/off. */
  onChange?: (enabled: boolean) => void;
  /**
   * Hide the button in rich-text mode, where vim is inapplicable. Defaults to
   * `true`. Set `false` to keep it visible so code-block vim can be toggled
   * while editing rich text.
   */
  hideInRichText?: boolean;
  /** Button labels. Defaults to `{ on: 'Vim: On', off: 'Vim: Off' }`. */
  labels?: { on: string; off: string };
  /** Extra class name for the button. */
  className?: string;
}

/**
 * Toolbar button that toggles vim bindings live, in place, on the editor's
 * CodeMirror surfaces. Shares a {@link Compartment} with the editor extensions
 * so toggling reconfigures the running editor without a remount.
 *
 * It also re-applies the current vim state when the editor (re)enters a
 * CodeMirror mode, so toggling vim and then switching view modes preserves the
 * user's choice.
 */
export function VimToggle({
  compartment,
  defaultEnabled = true,
  onChange,
  hideInRichText = true,
  labels = { on: 'Vim: On', off: 'Vim: Off' },
  className,
}: VimToggleProps): React.ReactElement | null {
  const [enabled, setEnabled] = React.useState(defaultEnabled);
  const viewMode = useCellValue(viewMode$);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const enabledRef = React.useRef(enabled);
  enabledRef.current = enabled;

  // Scope reconfigure to this editor instance, not every editor on the page.
  const scope = React.useCallback(
    (): ParentNode => buttonRef.current?.closest('.mdxeditor') ?? document,
    []
  );

  // When the editor (re)enters a CodeMirror mode, sync the freshly mounted
  // view(s) to the current vim state (the compartment's initial value reflects
  // mount-time defaults, which may now be stale after a toggle).
  React.useEffect(() => {
    if (viewMode === 'rich-text') return;
    const id = requestAnimationFrame(() => setVimEnabled(compartment, enabledRef.current, scope()));
    return () => cancelAnimationFrame(id);
  }, [viewMode, compartment, scope]);

  const toggle = React.useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      setVimEnabled(compartment, next, scope());
      onChange?.(next);
      return next;
    });
  }, [compartment, onChange, scope]);

  if (hideInRichText && viewMode === 'rich-text') {
    return null;
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={toggle}
      title="Toggle Vim keybindings (source view & code blocks)"
      aria-pressed={enabled}
      className={className}
      style={{
        marginLeft: 'auto',
        padding: '2px 10px',
        borderRadius: 4,
        cursor: 'pointer',
        fontFamily: 'var(--mdx-editor-font-family, monospace)',
        fontSize: 12,
        fontWeight: 600,
        border: '1px solid var(--baseBorder, #ccc)',
        backgroundColor: enabled
          ? 'var(--accentBg, rgba(0,102,204,0.1))'
          : 'var(--baseBg, transparent)',
        color: enabled ? 'var(--accentText, #06c)' : 'var(--baseText, inherit)',
      }}
    >
      {enabled ? labels.on : labels.off}
    </button>
  );
}
