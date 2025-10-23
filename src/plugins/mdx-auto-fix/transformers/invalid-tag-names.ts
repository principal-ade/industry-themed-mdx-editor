/**
 * Transformer: Auto-escape invalid HTML/JSX tag names
 *
 * Detects and escapes malformed tags that start with invalid characters:
 * - "<5Column>" → "&lt;5Column>"
 * - "<123>" → "&lt;123>"
 *
 * HTML/JSX tag names must start with a letter, _, or $
 */

import { visit } from 'unist-util-visit';
import type { Text } from 'mdast';
import type { Transformer, TransformerContext } from '../types';

/**
 * Transform invalid tag names to escaped entities
 */
export const invalidTagNamesTransformer: Transformer = {
  name: 'invalid-tag-names',
  description: 'Escapes tags with invalid names (e.g., "<5Column>" → "&lt;5Column>")',
  defaultEnabled: true,

  transform: (context: TransformerContext) => {
    let fixCount = 0;

    visit(context.tree, 'text', (node: Text) => {
      // Match patterns like <5Something> or </5Something>
      // Tag names must start with letter, $, or _
      node.value = node.value.replace(/<\/?(\d[^>\s]*)/g, (match) => {
        fixCount++;
        return match.replace('<', '&lt;');
      });

      // Also catch standalone invalid tags like <5>
      node.value = node.value.replace(/<(\d+)>/g, (match) => {
        fixCount++;
        return match.replace('<', '&lt;');
      });
    });

    context.stats.byTransformer[invalidTagNamesTransformer.name] = fixCount;
    context.stats.totalFixes += fixCount;
  },

  testCases: [
    {
      description: 'Tag starting with number',
      input: '<5Column>Content</5Column>',
      expected: '&lt;5Column>Content&lt;/5Column>',
      shouldFix: 'Should escape opening and closing tags that start with numbers',
    },
    {
      description: 'Numeric-only tag',
      input: '<123>',
      expected: '&lt;123>',
      shouldFix: 'Should escape tags that are only numbers',
    },
    {
      description: 'Tag with number prefix',
      input: '<3DModel src="path" />',
      expected: '&lt;3DModel src="path" />',
      shouldFix: 'Should escape self-closing tags that start with numbers',
    },
    {
      description: 'Should preserve valid tags',
      input: '<Component5>Content</Component5>',
      expected: '<Component5>Content</Component5>',
      shouldFix: 'Should not affect tags that start with valid characters',
    },
  ],
};
