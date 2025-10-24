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
    name: 'normalize-code-block-language',
    description: 'Normalize unknown or missing code block language identifiers',
    pattern: /^(\s*)```([^\n`]*?)\n/gim,
    replacement: (_match, indent, lang) => {
      const trimmedLang = lang.trim();

      // List of known/valid languages that should NOT be normalized
      const knownLanguages = [
        'javascript', 'js', 'typescript', 'ts', 'jsx', 'tsx',
        'python', 'py', 'java', 'c', 'cpp', 'csharp', 'cs',
        'html', 'css', 'scss', 'sass', 'less',
        'json', 'yaml', 'yml', 'xml', 'toml',
        'bash', 'sh', 'shell', 'powershell',
        'sql', 'graphql', 'markdown', 'md',
        'rust', 'go', 'ruby', 'php', 'swift',
        'kotlin', 'dart', 'r', 'matlab',
        'diff', 'text', 'plaintext',
      ];

      // If it's a known language, don't change it
      if (knownLanguages.includes(trimmedLang.toLowerCase())) {
        return _match; // Return original match unchanged
      }

      // Handle missing/empty language identifier
      if (!trimmedLang || trimmedLang === '') {
        return `${indent}\`\`\`markdown\n`;
      }

      // Handle specific unrecognized languages
      const langLower = trimmedLang.toLowerCase();
      if (langLower === 'n/a') {
        return `${indent}\`\`\`markdown\n`;
      }
      if (langLower === 'argdown') {
        return `${indent}\`\`\`markdown\n`; // Map argdown to markdown for better highlighting
      }

      // For any other unrecognized language, keep it as-is
      // (don't force to text - let the parser handle it)
      return _match;
    },
  },
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

  // First, normalize code block language identifiers (runs on full markdown)
  // This must happen before preserveCode to avoid the language part being protected
  let result = markdown;
  const codeBlockLangRule = activeRules.find(r => r.name === 'normalize-code-block-language');
  if (codeBlockLangRule) {
    let fixCount = 0;
    let insideCodeBlock = false; // Track if we're inside a code block

    if (typeof codeBlockLangRule.replacement === 'function') {
      result = result.replace(codeBlockLangRule.pattern, (...args) => {
        // Toggle state - if we're inside, this is a closing ```, skip it
        if (insideCodeBlock) {
          insideCodeBlock = false;
          return args[0]; // Return original match (closing ```)
        }

        // This is an opening ```, process it
        insideCodeBlock = true;
        const originalMatch = args[0];
        const replacement = (codeBlockLangRule.replacement as Function)(...args);

        // Only count as a fix if we actually changed something
        if (replacement !== originalMatch) {
          fixCount++;
        }

        return replacement;
      });
    } else {
      result = result.replace(codeBlockLangRule.pattern, (match) => {
        // Toggle state - if we're inside, this is a closing ```, skip it
        if (insideCodeBlock) {
          insideCodeBlock = false;
          return match; // Return original match (closing ```)
        }

        // This is an opening ```, process it
        insideCodeBlock = true;
        const replacement = codeBlockLangRule.replacement as string;

        // Only count as a fix if we actually changed something
        if (replacement !== match) {
          fixCount++;
        }

        return replacement;
      });
    }

    if (fixCount > 0) {
      stats.byTransformer[codeBlockLangRule.name] = fixCount;
      stats.totalFixes += fixCount;

      if (debug) {
        console.log(`[mdx-auto-fix] ${codeBlockLangRule.name}: ${fixCount} fixes`);
      }
    }
  }

  // Then apply other transformations (excluding the code block language rule)
  const otherRules = activeRules.filter(r => r.name !== 'normalize-code-block-language');

  const transform = (text: string): string => {
    let transformed = text;

    for (const rule of otherRules) {
      let fixCount = 0;

      if (typeof rule.replacement === 'function') {
        transformed = transformed.replace(rule.pattern, (...args) => {
          fixCount++;
          return (rule.replacement as Function)(...args);
        });
      } else {
        transformed = transformed.replace(rule.pattern, () => {
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

    return transformed;
  };

  result = preserveCodeBlocks
    ? preserveCode(result, transform)
    : transform(result);

  if (onStats && stats.totalFixes > 0) {
    onStats(stats);
  }

  if (debug && stats.totalFixes > 0) {
    console.log(`[mdx-auto-fix] Total preprocessing fixes: ${stats.totalFixes}`);
  }

  return result;
}
