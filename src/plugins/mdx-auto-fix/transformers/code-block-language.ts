/**
 * Transformer: Normalize code block language identifiers
 *
 * Handles code blocks with unrecognized or problematic language identifiers
 * by mapping them to known alternatives or "text" as a fallback.
 *
 * This prevents parsing errors when MDX encounters code blocks with
 * language identifiers it doesn't recognize.
 */

import { visit } from 'unist-util-visit';
import type { Code } from 'mdast';
import type { Transformer, TransformerContext } from '../types';

/**
 * Map of problematic or custom language identifiers to safe alternatives
 */
const LANGUAGE_MAP: Record<string, string> = {
  'N/A': 'text',
  'n/a': 'text',
  'argdown': 'markdown', // Map argdown to markdown for better syntax highlighting
  // Add more mappings as needed
};

/**
 * List of known safe language identifiers that don't need transformation
 */
const KNOWN_LANGUAGES = new Set([
  'javascript', 'js', 'typescript', 'ts', 'jsx', 'tsx',
  'python', 'py', 'java', 'c', 'cpp', 'csharp', 'cs',
  'html', 'css', 'scss', 'sass', 'less',
  'json', 'yaml', 'yml', 'xml', 'toml',
  'bash', 'sh', 'shell', 'powershell',
  'sql', 'graphql', 'markdown', 'md',
  'rust', 'go', 'ruby', 'php', 'swift',
  'kotlin', 'dart', 'r', 'matlab',
  'diff', 'text', 'plaintext',
]);

/**
 * Normalize code block language identifiers to prevent parsing errors
 */
export const codeBlockLanguageTransformer: Transformer = {
  name: 'code-block-language',
  description: 'Normalizes unrecognized code block language identifiers to safe alternatives',
  defaultEnabled: true,

  transform: (context: TransformerContext) => {
    let fixCount = 0;

    visit(context.tree, 'code', (node: Code) => {
      const lang = node.lang?.toLowerCase().trim();

      // Handle missing language
      if (!lang) {
        node.lang = 'text';
        fixCount++;
        return;
      }

      // Check if language is in our mapping
      if (LANGUAGE_MAP[lang]) {
        node.lang = LANGUAGE_MAP[lang];
        fixCount++;
        return;
      }

      // If language is unknown and not in our safe list, map to text
      if (!KNOWN_LANGUAGES.has(lang)) {
        // Keep the original as-is but you can uncomment below to force to text
        // node.lang = 'text';
        // fixCount++;
      }
    });

    context.stats.byTransformer[codeBlockLanguageTransformer.name] = fixCount;
    context.stats.totalFixes += fixCount;
  },

  testCases: [
    {
      description: 'Code block with N/A language',
      input: '```N/A\ncode here\n```',
      expected: '```text\ncode here\n```',
      shouldFix: 'Should convert N/A to text',
    },
    {
      description: 'Code block with argdown language',
      input: '```argdown\n[Claim]: Statement\n```',
      expected: '```markdown\n[Claim]: Statement\n```',
      shouldFix: 'Should convert argdown to markdown',
    },
    {
      description: 'Code block without language',
      input: '```\ncode here\n```',
      expected: '```text\ncode here\n```',
      shouldFix: 'Should add text language to blocks without one',
    },
    {
      description: 'Should preserve known languages',
      input: '```javascript\nconst x = 1;\n```',
      expected: '```javascript\nconst x = 1;\n```',
      shouldFix: 'Should not modify known languages',
    },
  ],
};
