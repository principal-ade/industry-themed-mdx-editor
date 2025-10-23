/**
 * Transformer: Auto-escape > followed by text that might be confused with closing tags
 *
 * Fixes patterns where > is used for comparisons:
 * - ">5 users" → "&gt;5 users"
 * - ">90% uptime" → "&gt;90% uptime"
 */

import { visit } from 'unist-util-visit';
import type { Text } from 'mdast';
import type { Transformer, TransformerContext } from '../types';

/**
 * Transform > followed by a digit to HTML entity
 */
export const greaterThanDigitTransformer: Transformer = {
  name: 'greater-than-digit',
  description: 'Escapes > when followed by a digit (e.g., ">5 users" → "&gt;5 users")',
  defaultEnabled: true,

  transform: (context: TransformerContext) => {
    let fixCount = 0;

    visit(context.tree, 'text', (node: Text) => {
      // Replace > followed by digit with HTML entity
      // But be careful not to match valid JSX closing tags
      node.value = node.value.replace(/(?<![-\w])>(?=\s?\d)/g, () => {
        fixCount++;
        return '&gt;';
      });
    });

    context.stats.byTransformer[greaterThanDigitTransformer.name] = fixCount;
    context.stats.totalFixes += fixCount;
  },

  testCases: [
    {
      description: 'Basic greater-than with digit',
      input: '- >90% completion rate',
      expected: '- &gt;90% completion rate',
      shouldFix: 'Should escape > immediately followed by digit',
    },
    {
      description: 'Greater-than with space and digit',
      input: '- > 5 users online',
      expected: '- &gt; 5 users online',
      shouldFix: 'Should escape > followed by space and digit',
    },
    {
      description: 'Multiple occurrences',
      input: 'Requirements: >5GB RAM, >10 cores, >100GB storage',
      expected: 'Requirements: &gt;5GB RAM, &gt;10 cores, &gt;100GB storage',
      shouldFix: 'Should fix all occurrences',
    },
    {
      description: 'Should not affect valid JSX closing tags',
      input: '<Component>content</Component>',
      expected: '<Component>content</Component>',
      shouldFix: 'Should preserve valid JSX closing tags',
    },
  ],
};
