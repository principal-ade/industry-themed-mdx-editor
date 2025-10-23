/**
 * MDX Auto-Fix Remark Plugin
 *
 * A remark plugin that automatically fixes common MDX parsing issues
 * by applying configurable transformers to the markdown AST.
 *
 * @example
 * ```typescript
 * import { mdxAutoFix } from './plugins/mdx-auto-fix';
 *
 * <MDXEditor
 *   remarkPlugins={[mdxAutoFix]}
 *   markdown={content}
 * />
 * ```
 *
 * @example With options
 * ```typescript
 * <MDXEditor
 *   remarkPlugins={[
 *     [mdxAutoFix, {
 *       disable: ['greater-than-digit'], // Disable specific transformers
 *       onStats: (stats) => console.log('Fixes applied:', stats),
 *       debug: true
 *     }]
 *   ]}
 *   markdown={content}
 * />
 * ```
 */

import type { Root } from 'mdast';
import type { Transformer, TransformerStats } from './types';
import { defaultTransformers } from './transformers';
import type { Plugin } from 'unified';

/**
 * Configuration options for the MDX Auto-Fix plugin
 */
export interface MDXAutoFixOptions {
  /**
   * List of transformers to use
   */
  transformers?: Transformer[];

  /**
   * Enable specific transformers by name
   */
  enable?: string[];

  /**
   * Disable specific transformers by name
   */
  disable?: string[];

  /**
   * Callback to receive statistics about fixes applied
   */
  onStats?: (stats: TransformerStats) => void;

  /**
   * Enable debug logging
   */
  debug?: boolean;
}

/**
 * Creates the MDX Auto-Fix remark plugin
 */
export const mdxAutoFix: Plugin<[MDXAutoFixOptions?], Root> = (options = {}) => {
  const {
    transformers = defaultTransformers,
    enable,
    disable,
    onStats,
    debug = false,
  } = options;

  return (tree: Root) => {
    // Initialize stats
    const stats: TransformerStats = {
      totalFixes: 0,
      byTransformer: {},
    };

    // Determine which transformers to use
    let activeTransformers: Transformer[] = transformers.filter(t => t.defaultEnabled);

    // Apply enable/disable filters
    if (enable && enable.length > 0) {
      activeTransformers = transformers.filter(t => enable.includes(t.name));
    }

    if (disable && disable.length > 0) {
      activeTransformers = activeTransformers.filter(t => !disable.includes(t.name));
    }

    if (debug) {
      console.log('[mdx-auto-fix] Active transformers:', activeTransformers.map(t => t.name));
    }

    // Apply each transformer
    for (const transformer of activeTransformers) {
      try {
        transformer.transform({
          tree,
          stats,
        });

        if (debug && stats.byTransformer[transformer.name] > 0) {
          console.log(
            `[mdx-auto-fix] ${transformer.name}: ${stats.byTransformer[transformer.name]} fixes`
          );
        }
      } catch (error) {
        console.error(`[mdx-auto-fix] Error in transformer "${transformer.name}":`, error);
      }
    }

    if (debug && stats.totalFixes > 0) {
      console.log(`[mdx-auto-fix] Total fixes applied: ${stats.totalFixes}`);
    }

    // Report stats
    if (onStats && stats.totalFixes > 0) {
      onStats(stats);
    }
  };
};

// Note: The preprocessor approach (preprocessMDX) is recommended over the remark plugin
// because it runs before the MDX parser, preventing parsing errors.
