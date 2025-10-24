/**
 * Tests for MDX Auto-Fix Preprocessor
 */

import { describe, expect, test } from 'bun:test';
import { preprocessMDX } from './preprocessor';
import type { TransformerStats } from './types';

describe('preprocessMDX', () => {
  test('should return unchanged markdown when no issues found', () => {
    const input = 'Normal markdown text';
    const output = preprocessMDX(input);
    expect(output).toBe(input);
  });

  test('should escape < followed by digit', () => {
    const input = '- <5 minutes to complete';
    const output = preprocessMDX(input);
    expect(output).toBe('- &lt;5 minutes to complete');
  });

  test('should escape < followed by space and digit', () => {
    const input = '- < 5 minutes to complete';
    const output = preprocessMDX(input);
    expect(output).toBe('- &lt; 5 minutes to complete');
  });

  test('should handle multiple < digit patterns', () => {
    const input = 'Metrics: <5ms latency, <10MB memory, <2% error rate';
    const output = preprocessMDX(input);
    expect(output).toBe('Metrics: &lt;5ms latency, &lt;10MB memory, &lt;2% error rate');
  });

  test('should escape > followed by digit', () => {
    const input = '- >90% completion rate';
    const output = preprocessMDX(input);
    expect(output).toBe('- &gt;90% completion rate');
  });

  test('should handle requirements list with >', () => {
    const input = 'Requirements: >5GB RAM, >10 cores';
    const output = preprocessMDX(input);
    expect(output).toBe('Requirements: &gt;5GB RAM, &gt;10 cores');
  });

  test('should escape invalid tag names starting with numbers', () => {
    const input = '<5Column>Content</5Column>';
    const output = preprocessMDX(input);
    expect(output).toBe('&lt;5Column>Content&lt;/5Column>');
  });

  test('should escape numeric-only tags', () => {
    const input = '<123>';
    const output = preprocessMDX(input);
    expect(output).toBe('&lt;123>');
  });

  test('should preserve valid JSX components', () => {
    const input = '<Component prop={5}>content</Component>';
    const output = preprocessMDX(input);
    expect(output).toBe(input);
  });

  test('should preserve valid tags that start with letters', () => {
    const input = '<Component5>Content</Component5>';
    const output = preprocessMDX(input);
    expect(output).toBe(input);
  });

  test('should report stats when fixes are applied', () => {
    let capturedStats: TransformerStats | undefined;

    const input = '- <5 minutes';
    preprocessMDX(input, {
      onStats: (stats) => {
        capturedStats = stats;
      },
    });

    expect(capturedStats).toBeDefined();
    expect(capturedStats!.totalFixes).toBe(1);
    expect(capturedStats!.byTransformer['less-than-digit']).toBe(1);
  });

  test('should allow disabling specific rules', () => {
    const input = '- <5 minutes and >90% uptime';
    const output = preprocessMDX(input, {
      disable: ['greater-than-digit'],
    });

    // Should fix < but not >
    expect(output).toContain('&lt;5');
    expect(output).toContain('>90%');
    expect(output).not.toContain('&gt;');
  });

  test('should allow enabling only specific rules', () => {
    const input = '- <5 minutes and >90% uptime';
    const output = preprocessMDX(input, {
      enable: ['less-than-digit'],
    });

    // Should only fix <
    expect(output).toContain('&lt;5');
    expect(output).toContain('>90%');
  });
});

describe('code preservation', () => {
  test('should not transform content inside code blocks', () => {
    const input = `\`\`\`typescript
const value = x < 5 ? 'small' : 'large';
if (count > 10) {
  // do something
}
\`\`\``;

    const output = preprocessMDX(input);
    expect(output).toBe(input);
  });

  test('should not transform content inside inline code', () => {
    const input = 'Use `<5` for less than five.';
    const output = preprocessMDX(input);
    expect(output).toBe(input);
  });

  test('should transform text outside code blocks', () => {
    const input = `Performance: <5ms

\`\`\`typescript
if (latency < 5) {
  console.log('fast');
}
\`\`\`

Target: <10ms`;

    const output = preprocessMDX(input);
    expect(output).toContain('Performance: &lt;5ms');
    expect(output).toContain('Target: &lt;10ms');
    expect(output).toContain('if (latency < 5)'); // Code block preserved
  });

  test('should handle mixed inline code and text', () => {
    const input = 'Use `<Component />` or check if value is <5.';
    const output = preprocessMDX(input);
    expect(output).toContain('`<Component />`');
    expect(output).toContain('value is &lt;5');
  });
});

describe('code block language normalization', () => {
  test('should normalize argdown language to markdown', () => {
    const input = `\`\`\`argdown
[Claim]: A statement
+ <Argument>: Supporting point
\`\`\``;

    const output = preprocessMDX(input);
    expect(output).toContain('```markdown\n');
    expect(output).toContain('[Claim]: A statement');
  });

  test('should normalize N/A language to text', () => {
    const input = `\`\`\`N/A
Some code here
\`\`\``;

    const output = preprocessMDX(input);
    expect(output).toContain('```text\n');
    expect(output).toContain('Some code here');
  });

  test('should normalize n/a (lowercase) to text', () => {
    const input = `\`\`\`n/a
Some code here
\`\`\``;

    const output = preprocessMDX(input);
    expect(output).toContain('```text\n');
    expect(output).toContain('Some code here');
  });

  test('should handle multiple argdown code blocks', () => {
    const input = `# Debate

\`\`\`argdown
[Claim 1]: First claim
\`\`\`

\`\`\`argdown
[Claim 2]: Second claim
\`\`\``;

    const output = preprocessMDX(input);
    const markdownBlocks = output.match(/```markdown/g);
    expect(markdownBlocks).toBeDefined();
    expect(markdownBlocks!.length).toBe(2);
  });

  test('should preserve known language identifiers', () => {
    const input = `\`\`\`javascript
const x = 1;
\`\`\`

\`\`\`typescript
const y: number = 2;
\`\`\``;

    const output = preprocessMDX(input);
    expect(output).toContain('```javascript\n');
    expect(output).toContain('```typescript\n');
  });

  test('should handle argdown blocks with complex content', () => {
    const input = `\`\`\`argdown
# Should AI Be Regulated?

[AI should be regulated]: Government oversight of AI is necessary.

  + <Existential Risk Argument>: AI poses risks to humanity.
    (1) AI systems could make harmful decisions autonomously
    (2) Without oversight, these decisions are unchecked
    ----
    (3) Therefore, AI should be regulated
\`\`\``;

    const output = preprocessMDX(input);
    expect(output).toContain('```markdown\n');
    expect(output).toContain('AI should be regulated');
    expect(output).toContain('Existential Risk Argument');
    expect(output).toContain('(1) AI systems');
  });

  test('should report stats for code block language fixes', () => {
    let capturedStats: TransformerStats | undefined;

    const input = `\`\`\`argdown
[Claim]: Statement
\`\`\``;

    preprocessMDX(input, {
      onStats: (stats) => {
        capturedStats = stats;
      },
    });

    expect(capturedStats).toBeDefined();
    expect(capturedStats!.totalFixes).toBe(1);
    expect(capturedStats!.byTransformer['normalize-code-block-language']).toBe(1);
  });

  test('should allow disabling code block language normalization', () => {
    const input = `\`\`\`argdown
[Claim]: Statement
\`\`\``;

    const output = preprocessMDX(input, {
      disable: ['normalize-code-block-language'],
    });

    expect(output).toContain('```argdown\n');
  });

  test('should normalize code blocks with no language identifier', () => {
    const input = `\`\`\`
Some text without language
\`\`\``;

    const output = preprocessMDX(input);
    expect(output).toContain('```text\n');
    expect(output).toContain('Some text without language');
  });

  test('should normalize multiple code blocks with missing languages', () => {
    const input = `First block:
\`\`\`
Block 1
\`\`\`

Second block:
\`\`\`
Block 2
\`\`\``;

    const output = preprocessMDX(input);
    const textBlocks = output.match(/```text/g);
    expect(textBlocks).toBeDefined();
    expect(textBlocks!.length).toBe(2);
  });

  test('should handle ASCII art diagrams without language', () => {
    const input = `\`\`\`
┌─────────────────┐
│ Package 1       │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Package 2       │
└─────────────────┘
\`\`\``;

    const output = preprocessMDX(input);
    expect(output).toContain('```text\n');
    expect(output).toContain('Package 1');
  });

  test('should preserve python blocks while fixing empty blocks', () => {
    const input = `\`\`\`python
def hello():
    print("world")
\`\`\`

\`\`\`
No language here
\`\`\``;

    const output = preprocessMDX(input);
    expect(output).toContain('```python\n');
    expect(output).toContain('```text\n');
    expect(output).toContain('def hello()');
  });

  test('should handle indented code blocks (in lists or quotes)', () => {
    const input = `Some text

  \`\`\`
  Indented block
  \`\`\`

More text`;

    const output = preprocessMDX(input);
    expect(output).toContain('  ```text\n');
    expect(output).toContain('Indented block');
  });

  test('should handle indented argdown blocks', () => {
    const input = `List item:

    \`\`\`argdown
    [Claim]: Statement
    \`\`\``;

    const output = preprocessMDX(input);
    expect(output).toContain('    ```markdown\n');
    expect(output).toContain('[Claim]: Statement');
  });
});

describe('real-world examples', () => {
  test('should fix deployment options document', () => {
    const input = `**Target**:
- 90%+ setup completion rate
- <5 minutes to first workflow
- <5% configuration error rate`;

    const output = preprocessMDX(input);

    expect(output).toContain('&lt;5 minutes');
    expect(output).toContain('&lt;5%');
    expect(output).not.toContain('- <5'); // Should be fixed
  });

  test('should handle complex document with multiple issues', () => {
    const input = `# Performance Metrics

Requirements:
- <5ms latency
- >90% uptime
- <2GB memory

## Notes

Use the <3DModel> component for rendering.

**Target**: <100 requests/second`;

    const output = preprocessMDX(input);

    expect(output).toContain('&lt;5ms');
    expect(output).toContain('&gt;90%');
    expect(output).toContain('&lt;2GB');
    expect(output).toContain('&lt;3DModel');
    expect(output).toContain('&lt;100');
  });

  test('should handle table with comparisons', () => {
    const input = `| Feature | Requirement |
|---------|-------------|
| Latency | <10ms |
| Uptime | >99.9% |
| Size | <5MB |`;

    const output = preprocessMDX(input);

    expect(output).toContain('&lt;10ms');
    expect(output).toContain('&gt;99.9%');
    expect(output).toContain('&lt;5MB');
  });
});

describe('edge cases', () => {
  test('should handle empty string', () => {
    const output = preprocessMDX('');
    expect(output).toBe('');
  });

  test('should handle string with only whitespace', () => {
    const input = '   \n\n  ';
    const output = preprocessMDX(input);
    expect(output).toBe(input);
  });

  test('should handle multiple consecutive issues', () => {
    const input = '<5<10<15';
    const output = preprocessMDX(input);
    expect(output).toBe('&lt;5&lt;10&lt;15');
  });

  test('should handle mixed valid and invalid tags', () => {
    const input = 'Use <Component/> for UI, <5seconds for speed, and <AnotherComponent>';
    const output = preprocessMDX(input);
    expect(output).toContain('<Component/>');
    expect(output).toContain('&lt;5seconds');
    expect(output).toContain('<AnotherComponent>');
  });
});

describe('performance', () => {
  test('should handle large documents efficiently', () => {
    // Create a large document with many potential fixes
    const lines = [];
    for (let i = 0; i < 1000; i++) {
      lines.push(`- Line ${i}: <${i} items, >${i * 2}% completion`);
    }
    const input = lines.join('\n');

    const start = performance.now();
    const output = preprocessMDX(input);
    const duration = performance.now() - start;

    expect(output).toBeDefined();
    expect(output.length).toBeGreaterThan(input.length); // Should be longer due to &lt; replacements
    expect(duration).toBeLessThan(100); // Should complete quickly
  });

  test('should handle large code blocks efficiently', () => {
    const codeBlock = '```\n' + 'if (x < 5 && y > 10) {}\n'.repeat(1000) + '```';
    const input = `Before\n\n${codeBlock}\n\nAfter <5`;

    const start = performance.now();
    const output = preprocessMDX(input);
    const duration = performance.now() - start;

    expect(output).toContain('x < 5'); // Code preserved
    expect(output).toContain('After &lt;5'); // Text fixed
    expect(duration).toBeLessThan(100);
  });
});
