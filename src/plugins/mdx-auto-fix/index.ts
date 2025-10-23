/**
 * MDX Auto-Fix Plugin
 *
 * A preprocessing utility and remark plugin that automatically fixes common MDX parsing issues.
 *
 * @packageDocumentation
 */

// Preprocessor (recommended approach - runs before parsing)
export { preprocessMDX, defaultPreprocessRules } from './preprocessor';
export type { PreprocessRule } from './preprocessor';

// Remark plugin (AST-based approach - note: preprocessor is recommended)
export { mdxAutoFix } from './plugin';
export type { MDXAutoFixOptions } from './plugin';

// Types
export type {
  Transformer,
  TransformerContext,
  TransformerStats,
  TransformerTestCase,
} from './types';

// Transformers
export {
  lessThanDigitTransformer,
  greaterThanDigitTransformer,
  invalidTagNamesTransformer,
  defaultTransformers,
  allTransformers,
} from './transformers';
