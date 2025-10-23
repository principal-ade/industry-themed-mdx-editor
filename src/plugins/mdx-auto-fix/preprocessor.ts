/**
 * MDX Auto-Fix Preprocessor
 *
 * Transforms raw markdown strings before they are parsed by MDX.
 * This is necessary because the MDX parser will fail before remark plugins can run.
 */

import type { TransformerStats } from './types';

/**
 * Rule for text-based transformation
 */
export interface PreprocessRule {
  name: string;
  description: string;
  pattern: RegExp;
  replacement: string | ((match: string, ...args: any[]) => string);
}

/**
 * Convert transformers to preprocessing rules
 */
export const defaultPreprocessRules: PreprocessRule[] = [
  {
    name: 'less-than-digit',
    description: 'Escape < followed by digit',
    pattern: /<(?=\d)/g,
    replacement: '&lt;',
  },
  {
    name: 'less-than-space-digit',
    description: 'Escape < followed by space and digit',
    pattern: /<(\s+)(?=\d)/g,
    replacement: (_match, spaces) => `&lt;${spaces}`,
  },
  {
    name: 'greater-than-digit',
    description: 'Escape > followed by digit',
    pattern: /(?<![-\w])>(?=\s?\d)/g,
    replacement: '&gt;',
  },
  {
    name: 'invalid-tag-opening',
    description: 'Escape invalid opening tags starting with digit',
    pattern: /<(\/?(?:\d[^>\s]*))/g,
    replacement: (_match, tagContent) => `&lt;${tagContent}`,
  },
  {
    name: 'numeric-only-tag',
    description: 'Escape tags that are only numbers',
    pattern: /<(\d+)>/g,
    replacement: (_match, number) => `&lt;${number}>`,
  },
];

/**
 * Preserves code blocks and inline code during transformation
 */
function preserveCode(markdown: string, transform: (text: string) => string): string {
  const parts: { type: 'code' | 'text'; content: string; }[] = [];

  // Match code blocks and inline code
  const codeRegex = /(```[\s\S]*?```|`[^`\n]+`)/g;
  let lastIndex = 0;
  let match;

  while ((match = codeRegex.exec(markdown)) !== null) {
    // Add text before code
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: markdown.slice(lastIndex, match.index),
      });
    }

    // Add code as-is
    parts.push({
      type: 'code',
      content: match[0],
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < markdown.length) {
    parts.push({
      type: 'text',
      content: markdown.slice(lastIndex),
    });
  }

  // Transform only text parts
  return parts
    .map(part => part.type === 'code' ? part.content : transform(part.content))
    .join('');
}

/**
 * Preprocess markdown to fix common MDX parsing issues
 */
export function preprocessMDX(
  markdown: string,
  options: {
    rules?: PreprocessRule[];
    enable?: string[];
    disable?: string[];
    preserveCodeBlocks?: boolean;
    onStats?: (stats: TransformerStats) => void;
    debug?: boolean;
  } = {}
): string {
  const {
    rules = defaultPreprocessRules,
    enable,
    disable,
    preserveCodeBlocks = true,
    onStats,
    debug = false,
  } = options;

  // Filter rules based on enable/disable
  let activeRules = rules;

  if (enable && enable.length > 0) {
    activeRules = rules.filter(r => enable.includes(r.name));
  }

  if (disable && disable.length > 0) {
    activeRules = activeRules.filter(r => !disable.includes(r.name));
  }

  if (debug) {
    console.log('[mdx-auto-fix] Active preprocessing rules:', activeRules.map(r => r.name));
  }

  const stats: TransformerStats = {
    totalFixes: 0,
    byTransformer: {},
  };

  const transform = (text: string): string => {
    let result = text;

    for (const rule of activeRules) {
      let fixCount = 0;

      if (typeof rule.replacement === 'function') {
        result = result.replace(rule.pattern, (...args) => {
          fixCount++;
          return (rule.replacement as Function)(...args);
        });
      } else {
        result = result.replace(rule.pattern, () => {
          fixCount++;
          return rule.replacement as string;
        });
      }

      if (fixCount > 0) {
        stats.byTransformer[rule.name] = (stats.byTransformer[rule.name] || 0) + fixCount;
        stats.totalFixes += fixCount;

        if (debug) {
          console.log(`[mdx-auto-fix] ${rule.name}: ${fixCount} fixes`);
        }
      }
    }

    return result;
  };

  const result = preserveCodeBlocks
    ? preserveCode(markdown, transform)
    : transform(markdown);

  if (onStats && stats.totalFixes > 0) {
    onStats(stats);
  }

  if (debug && stats.totalFixes > 0) {
    console.log(`[mdx-auto-fix] Total preprocessing fixes: ${stats.totalFixes}`);
  }

  return result;
}
