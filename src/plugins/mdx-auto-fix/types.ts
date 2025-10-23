/**
 * Types for MDX Auto-Fix Plugin
 * A remark plugin that automatically fixes common MDX parsing issues
 */

import type { Root } from 'mdast';

/**
 * Context provided to each transformer
 */
export interface TransformerContext {
  /**
   * The markdown AST node tree
   */
  tree: Root;

  /**
   * Original markdown string (if available)
   */
  originalMarkdown?: string;

  /**
   * Statistics about fixes applied
   */
  stats: TransformerStats;
}

/**
 * Statistics tracking fixes applied by transformers
 */
export interface TransformerStats {
  /**
   * Total number of fixes applied
   */
  totalFixes: number;

  /**
   * Fixes by transformer name
   */
  byTransformer: Record<string, number>;
}

/**
 * A transformer that fixes a specific type of MDX issue
 */
export interface Transformer {
  /**
   * Unique name for this transformer
   */
  name: string;

  /**
   * Description of what this transformer fixes
   */
  description: string;

  /**
   * Whether this transformer is enabled by default
   */
  defaultEnabled: boolean;

  /**
   * Apply the transformation to the AST
   */
  transform: (context: TransformerContext) => void;

  /**
   * Test cases demonstrating what this transformer fixes
   */
  testCases?: TransformerTestCase[];
}

/**
 * A test case for a transformer
 */
export interface TransformerTestCase {
  /**
   * Description of what this test case covers
   */
  description: string;

  /**
   * Input markdown that has the issue
   */
  input: string;

  /**
   * Expected output after transformation
   */
  expected: string;

  /**
   * Optional - specific test for the issue
   */
  shouldFix?: string;
}

// Note: MDXAutoFixOptions is now defined in plugin.ts
