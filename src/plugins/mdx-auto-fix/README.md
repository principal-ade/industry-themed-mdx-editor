# MDX Auto-Fix

A preprocessing utility and remark plugin that automatically fixes common MDX parsing issues.

## The Problem

MDX parsers interpret `<` as the start of a JSX tag, which causes parsing errors when technical documentation uses comparison operators:

```markdown
# Performance Metrics

Requirements:
- <5 minutes to complete
- >90% uptime
- <2GB memory
```

**Error**: `Unexpected character '5' (U+0035) before name, expected a character that can start a name, such as a letter, '$', or '_'`

This is a very common pattern in technical documentation for time estimates, performance metrics, size comparisons, and percentages.

## The Solution

MDX Auto-Fix provides two approaches to fix these issues:

### 1. Preprocessor (Recommended)

Transforms the raw markdown string **before** it's parsed by MDX:

```typescript
import { preprocessMDX } from '@principal-ade/industry-themed-mdx-editor/plugins/mdx-auto-fix';

const fixed = preprocessMDX('- <5 minutes to complete');
// Result: '- &lt;5 minutes to complete'
```

### 2. Remark Plugin

Transforms the markdown AST after parsing (for already-valid MDX):

```typescript
import { mdxAutoFix } from '@principal-ade/industry-themed-mdx-editor/plugins/mdx-auto-fix';

<MDXEditor
  remarkPlugins={[mdxAutoFix]}
  markdown={content}
/>
```

## Features

### What Gets Fixed

| Pattern | Before | After |
|---------|--------|-------|
| Less-than with digit | `<5 minutes` | `&lt;5 minutes` |
| Less-than with space | `< 5 minutes` | `&lt; 5 minutes` |
| Greater-than with digit | `>90% uptime` | `&gt;90% uptime` |
| Invalid tag names | `<5Column>` | `&lt;5Column>` |
| Numeric-only tags | `<123>` | `&lt;123>` |

### What Stays Unchanged

- ✅ Valid JSX components: `<Component prop={5} />`
- ✅ Valid tag names: `<Component5>content</Component5>`
- ✅ Code blocks: `` ```if (x < 5)``` ``
- ✅ Inline code: `` `<5` ``

## Usage

### With ThemedMDXEditor

Auto-fixing is **enabled by default**:

```typescript
import { ThemedMDXEditor } from '@principal-ade/industry-themed-mdx-editor';

<ThemedMDXEditor
  theme={myTheme}
  markdown={markdown}
  // Auto-fixing is enabled by default
/>
```

Disable if needed:

```typescript
<ThemedMDXEditor
  theme={myTheme}
  markdown={markdown}
  autoFixMDX={false}  // Disable auto-fixing
/>
```

### Standalone Preprocessor

```typescript
import { preprocessMDX } from '@principal-ade/industry-themed-mdx-editor/plugins/mdx-auto-fix';

// Basic usage
const fixed = preprocessMDX(markdown);

// With options
const fixed = preprocessMDX(markdown, {
  // Disable specific rules
  disable: ['greater-than-digit'],

  // Or enable only specific rules
  enable: ['less-than-digit', 'invalid-tag-names'],

  // Preserve code blocks (default: true)
  preserveCodeBlocks: true,

  // Get statistics
  onStats: (stats) => {
    console.log(`Applied ${stats.totalFixes} fixes`);
    console.log(stats.byTransformer);
  },

  // Enable debug logging
  debug: true,
});
```

### As a Remark Plugin

```typescript
import { mdxAutoFix } from '@principal-ade/industry-themed-mdx-editor/plugins/mdx-auto-fix';
import { MDXEditor } from '@mdxeditor/editor';

<MDXEditor
  remarkPlugins={[
    [mdxAutoFix, {
      disable: ['greater-than-digit'],
      onStats: (stats) => console.log(stats),
      debug: true,
    }]
  ]}
  markdown={content}
/>
```

## Available Rules

### `less-than-digit`
Escapes `<` when immediately followed by a digit.
- Example: `<5 minutes` → `&lt;5 minutes`

### `less-than-space-digit`
Escapes `<` followed by space(s) and a digit.
- Example: `< 5 minutes` → `&lt; 5 minutes`

### `greater-than-digit`
Escapes `>` when followed by a digit.
- Example: `>90% uptime` → `&gt;90% uptime`

### `invalid-tag-opening`
Escapes tags that start with digits (invalid in HTML/JSX).
- Example: `<5Column>` → `&lt;5Column>`

### `numeric-only-tag`
Escapes tags that are only numbers.
- Example: `<123>` → `&lt;123>`

## Real-World Examples

### Performance Metrics

```markdown
# System Requirements

- <5ms latency
- >99.9% uptime
- <2GB RAM
- >10 CPU cores
```

✅ All comparisons are automatically escaped

### Time Estimates

```markdown
**Goals**:
- <5 minutes to first deployment
- <30 seconds build time
- >100 requests/second
```

✅ Parsed correctly without errors

### Size Comparisons

```markdown
| Feature | Size |
|---------|------|
| Bundle  | <10MB |
| Images  | <500KB |
| Cache   | >1GB |
```

✅ Table renders properly

## API Reference

### `preprocessMDX(markdown, options?)`

Preprocesses markdown to fix common MDX issues.

**Parameters:**
- `markdown` (string): The markdown to process
- `options` (object, optional):
  - `rules` (PreprocessRule[]): Custom rules to use
  - `enable` (string[]): Names of rules to enable
  - `disable` (string[]): Names of rules to disable
  - `preserveCodeBlocks` (boolean): Don't transform code blocks (default: true)
  - `onStats` ((stats: TransformerStats) => void): Callback for statistics
  - `debug` (boolean): Enable debug logging

**Returns:** string - The processed markdown

### `mdxAutoFix(options?)`

Remark plugin for MDX auto-fixing.

**Parameters:**
- `options` (object, optional):
  - `transformers` (Transformer[]): Custom transformers
  - `enable` (string[]): Transformer names to enable
  - `disable` (string[]): Transformer names to disable
  - `onStats` ((stats: TransformerStats) => void): Callback for statistics
  - `debug` (boolean): Enable debug logging

**Returns:** Remark plugin

## Custom Rules

You can create your own preprocessing rules:

```typescript
import { preprocessMDX, type PreprocessRule } from '@principal-ade/industry-themed-mdx-editor/plugins/mdx-auto-fix';

const myRule: PreprocessRule = {
  name: 'my-custom-rule',
  description: 'Fixes my specific issue',
  pattern: /some-pattern/g,
  replacement: 'replacement-text',
  // Or use a function for complex replacements
  replacement: (match, ...args) => {
    return transformedText;
  },
};

const fixed = preprocessMDX(markdown, {
  rules: [myRule],
});
```

## Testing

The plugin includes comprehensive tests for all transformers:

```bash
# Run all tests
bun test src/plugins/mdx-auto-fix/

# Run specific test file
bun test src/plugins/mdx-auto-fix/preprocessor.test.ts

# Watch mode
bun test --watch src/plugins/mdx-auto-fix/
```

## Performance

The preprocessor is designed for efficiency:

- ✅ Handles 1000+ line documents in <100ms
- ✅ Preserves code blocks without parsing overhead
- ✅ Single-pass transformation
- ✅ Regex-based (no AST overhead)

## Future Publishing

This plugin is designed to be published as a standalone package:

```json
{
  "name": "@principal-ade/mdx-auto-fix",
  "description": "Automatically fix common MDX parsing issues",
  "keywords": ["mdx", "markdown", "parser", "fix", "preprocessing"]
}
```

## Contributing

To add a new transformer:

1. Create a new file in `src/plugins/mdx-auto-fix/transformers/`
2. Implement the `Transformer` interface with test cases
3. Export from `transformers/index.ts`
4. Add corresponding preprocessing rule
5. Add tests
6. Update documentation

## License

MIT

## Credits

Created by the Principal ADE Team as part of the industry-themed-mdx-editor project.
