/**
 * Transformer: Auto-escape < followed by digits
 *
 * Fixes the common pattern where technical documentation uses < for comparisons:
 * - "<5 minutes" → "&lt;5 minutes"
 * - "<10MB" → "&lt;10MB"
 * - "<100ms" → "&lt;100ms"
 *
 * MDX parsers interpret < as the start of a JSX tag, but tag names cannot
 * start with digits, causing parsing errors.
 */

import { visit } from 'unist-util-visit';
import type { Text } from 'mdast';
import type { Transformer, TransformerContext } from '../types';

/**
 * Transform < followed by a digit to HTML entity
 */
export const lessThanDigitTransformer: Transformer = {
  name: 'less-than-digit',
  description: 'Escapes < when followed by a digit (e.g., "<5 minutes" → "&lt;5 minutes")',
  defaultEnabled: true,

  transform: (context: TransformerContext) => {
    let fixCount = 0;

    visit(context.tree, 'text', (node: Text) => {
      // Replace < followed by digit with HTML entity
      node.value = node.value.replace(/<(?=\d)/g, () => {
        fixCount++;
        return '&lt;';
      });

      // Also handle < followed by space then digit (e.g., "< 5 minutes")
      node.value = node.value.replace(/<\s+(?=\d)/g, (match) => {
        fixCount++;
        return match.replace('<', '&lt;');
      });
    });

    context.stats.byTransformer[lessThanDigitTransformer.name] = fixCount;
    context.stats.totalFixes += fixCount;
  },

  testCases: [
    {
      description: 'Basic less-than with digit',
      input: '- <5 minutes to complete',
      expected: '- &lt;5 minutes to complete',
      shouldFix: 'Should escape < immediately followed by digit',
    },
    {
      description: 'Less-than with space and digit',
      input: '- < 5 minutes to complete',
      expected: '- &lt; 5 minutes to complete',
      shouldFix: 'Should escape < followed by space and digit',
    },
    {
      description: 'Multiple occurrences',
      input: 'Metrics: <5ms latency, <10MB memory, <2% error rate',
      expected: 'Metrics: &lt;5ms latency, &lt;10MB memory, &lt;2% error rate',
      shouldFix: 'Should fix all occurrences in a line',
    },
    {
      description: 'Percentage comparisons',
      input: '- <5% configuration error rate',
      expected: '- &lt;5% configuration error rate',
      shouldFix: 'Should fix percentage comparisons',
    },
    {
      description: 'Size comparisons',
      input: 'Bundle size: <20MB',
      expected: 'Bundle size: &lt;20MB',
      shouldFix: 'Should fix size comparisons',
    },
    {
      description: 'Time estimates in lists',
      input: `**Target**:
- 90%+ setup completion rate
- <5 minutes to first workflow
- <5% configuration error rate`,
      expected: `**Target**:
- 90%+ setup completion rate
- &lt;5 minutes to first workflow
- &lt;5% configuration error rate`,
      shouldFix: 'Should fix real-world documentation patterns',
    },
    {
      description: 'Should not affect valid JSX',
      input: '<Component prop={5} />',
      expected: '<Component prop={5} />',
      shouldFix: 'Should preserve valid JSX tags',
    },
  ],
};
