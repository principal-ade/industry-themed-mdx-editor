# Known issue: `@principal-ai/mdx-editor` is bundled despite being a peer dependency

**Status:** Known / accepted for now. Shipping as-is; revisit if it causes problems in a consumer (e.g. `industry-themed-file-editing-panels`).

**Owner action if it bites:** apply the fix in [The fix](#the-fix) and re-test the consuming app.

---

## Summary

`@principal-ai/mdx-editor` is declared as a **peerDependency** in `package.json`, but
the esbuild config in `scripts/build.mjs` does **not** list it in `external`. As a
result esbuild inlines the entire editor (plus Lexical and `@mdxeditor/gurx`) into
`dist/index.mjs`.

A peer dependency is a promise: *"the host app provides this single copy; I will not
bundle my own."* The build currently breaks that promise.

## Evidence (captured 2026-05-30)

```
dist/index.mjs                                   ~1.5 MB
grep -c node_modules/@principal-ai/mdx-editor    33   # editor inlined
grep -c node_modules/lexical                     2    # Lexical inlined
grep -c node_modules/@mdxeditor/gurx             1    # gurx inlined

package.json peerDependencies: @codemirror/state, @codemirror/view,
                               @principal-ai/mdx-editor, react, react-dom
scripts/build.mjs external:    react, react-dom, @mdxeditor/editor,
                               @principal-ade/industry-theme, remark, remark-mdx,
                               unist-util-visit, mdast, @codemirror/state, @codemirror/view
```

Note also: `@mdxeditor/editor` is still in the `external` list but the package no
longer imports it (we migrated to `@principal-ai/mdx-editor` in commit `4a3ded9`).
That entry is **dead config** — the migration updated the imports but not the
`external` list, which is how `@principal-ai/mdx-editor` got missed.

## Why it currently works anyway

Because *everything* is bundled together into one `dist`, there is exactly **one**
instance of `@mdxeditor/gurx` and **one** Lexical in our output. All the editor's
module-level singletons and React contexts (the gurx `Realm`, the Lexical editor
context) line up because they come from the same inlined copy. So today it works —
but by accident of bundling, not by design.

This matters for the vim integration (`src/vim.tsx`): `ViewModeReporter` reads the
editor's `viewMode$` cell via `useCellValue` from `@mdxeditor/gurx`. That only works
if our gurx instance is the *same* instance the editor uses. Today that holds because
both are inlined together.

## The risks (why this is worth fixing eventually)

1. **Duplicate editor → broken contexts/singletons (the real danger).**
   The consumer installs `@principal-ai/mdx-editor` (it's a peer dep), so there are
   **two copies**: one inlined in our `dist`, one in the app's `node_modules`. If the
   app — or another themed library — touches `@principal-ai/mdx-editor` directly, the
   two editors won't share the gurx `Realm` / Lexical context. Components from one
   copy can't read the other's context. Lexical in particular errors on multiple
   instances. This is the classic "two copies of React" class of bug.

2. **Bundle bloat / no dedup.** ~1.5 MB inlined, un-tree-shakeable, shipped to every
   consumer even though they already have the editor installed.

3. **Version skew makes the peer range meaningless.** We ship whatever was bundled at
   *our* build time, ignoring the version the consumer installed. The `>=1.0.0` peer
   range claims a flexibility we don't honor.

4. **Stale `@mdxeditor/editor` external.** Harmless no-op, but a smell.

## The fix

Externalize the editor (and the packages that must remain singletons) so the consumer
provides exactly one copy. In `scripts/build.mjs`:

```js
external: [
  'react', 'react-dom',
  '@principal-ade/industry-theme',
  '@principal-ai/mdx-editor',   // ADD — the big one
  '@mdxeditor/gurx',            // ADD — singleton; must match the editor's instance
  '@codemirror/state', '@codemirror/view',
  // REMOVE '@mdxeditor/editor' (dead)
  // 'remark' / 'remark-mdx' / 'unist-util-visit' / 'mdast' become moot once the
  // editor is external (they were only reachable through it)
],
```

Then adjust `package.json`:

- Move `@mdxeditor/gurx` and `@replit/codemirror-vim` out of `devDependencies` into
  `peerDependencies` (or `dependencies`), since once externalized the consumer must
  resolve them. `@mdxeditor/gurx` is already a transitive dep of the editor, so it
  resolves in practice; declaring it makes the contract explicit.

The most robust option for a thin wrapper like this is to externalize **all**
third-party bare imports and bundle only our own `src/`. Then singletons are correct
by construction and `dist` shrinks from ~1.5 MB to tens of KB.

### After applying the fix, verify

- `bun run build` succeeds and `dist/index.mjs` is dramatically smaller.
- `dist/index.mjs` no longer inlines `node_modules/@principal-ai/mdx-editor` /
  `lexical` / `@mdxeditor/gurx` (they appear as `import ... from '...'` instead).
- The vim stories still work in Storybook (`ViewModeReporter` still reads `viewMode$`).
- **Re-test the consuming app** (`industry-themed-file-editing-panels`) — this change
  shifts module resolution to the host, so it must be validated there, not just here.

## Why we're deferring

The fix is correct but it's a build-resolution change that requires re-testing the
consumer. For now we ship the bundled build (it works), and will revisit if the
duplication/context issue actually surfaces.
