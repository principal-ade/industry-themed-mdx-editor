# Code Block Language Normalization Fix

## Problem

The MDX editor was failing to parse markdown files containing code blocks with unrecognized language identifiers like `argdown` or `N/A`, showing the error:

```
Parsing of the following markdown structure failed: {"type":"code","name":"N/A"}
```

## Solution

Added automatic normalization of unrecognized code block language identifiers in the MDX Auto-Fix plugin.

### What Was Added

#### 1. New Preprocessing Rule (`src/plugins/mdx-auto-fix/preprocessor.ts`)

A new preprocessing rule `normalize-code-block-language` that runs **before** the MDX parser:

- Maps `argdown` → `markdown` (for better syntax highlighting)
- Maps `N/A` or `n/a` → `text`
- Runs before code block preservation to ensure language identifiers are fixed

#### 2. New AST Transformer (`src/plugins/mdx-auto-fix/transformers/code-block-language.ts`)

A new transformer that works on the parsed AST as a fallback:

- Handles code blocks with missing or unrecognized language identifiers
- Provides a configurable mapping of language identifiers
- Includes comprehensive test cases

#### 3. Enhanced Test Coverage (`src/plugins/mdx-auto-fix/preprocessor.test.ts`)

Added 8 new test cases covering:
- Argdown language normalization
- N/A language handling (case-insensitive)
- Multiple code blocks
- Complex argdown content
- Stats reporting
- Ability to disable the feature

## How It Works

### Before
```markdown
\`\`\`argdown
[Claim]: A statement being argued about.
  + <Supporting Argument>: Why the claim is true.
\`\`\`
```

**Result:** ❌ Parsing error: `{"type":"code","name":"N/A"}`

### After
```markdown
\`\`\`markdown
[Claim]: A statement being argued about.
  + <Supporting Argument>: Why the claim is true.
\`\`\`
```

**Result:** ✅ Successfully parsed and rendered

## Usage

The fix is **enabled by default** in the MDX Auto-Fix plugin. No configuration needed!

### Customization

If you want to customize the language mapping or add more languages:

```typescript
// In src/plugins/mdx-auto-fix/transformers/code-block-language.ts
const LANGUAGE_MAP: Record<string, string> = {
  'N/A': 'text',
  'n/a': 'text',
  'argdown': 'markdown',
  'yourCustomLang': 'text', // Add your custom mappings here
};
```

### Disabling the Feature

If you need to disable this feature for any reason:

```typescript
import { preprocessMDX } from '@principal-ade/industry-themed-mdx-editor';

const result = preprocessMDX(markdown, {
  disable: ['normalize-code-block-language']
});
```

## Test Results

All 34 tests pass, including 8 new tests specifically for code block language normalization:

```
✓ should normalize argdown language to markdown
✓ should normalize N/A language to text
✓ should normalize n/a (lowercase) to text
✓ should handle multiple argdown code blocks
✓ should preserve known language identifiers
✓ should handle argdown blocks with complex content
✓ should report stats for code block language fixes
✓ should allow disabling code block language normalization
```

## Example with Your File

Your file `/Users/griever/Developer/Pixel/UI_TEAM_BRIEF.md` contains code blocks with `argdown` language identifiers. With this fix:

1. All `\`\`\`argdown` blocks are automatically converted to `\`\`\`markdown`
2. The content remains unchanged
3. The MDX editor can now parse and display the file without errors
4. You get proper markdown syntax highlighting instead of parsing errors

## Version

This fix is included in version **0.1.4** (pending version bump).

## Files Modified

1. `src/plugins/mdx-auto-fix/preprocessor.ts` - Added preprocessing rule
2. `src/plugins/mdx-auto-fix/transformers/code-block-language.ts` - New transformer (created)
3. `src/plugins/mdx-auto-fix/transformers/index.ts` - Export new transformer
4. `src/plugins/mdx-auto-fix/preprocessor.test.ts` - Added test cases

## Next Steps

To use this fix with your file:

1. Rebuild your project: `npm run build`
2. Open your markdown file in the MDX editor
3. The `argdown` code blocks will automatically be normalized to `markdown`
4. No more parsing errors!
