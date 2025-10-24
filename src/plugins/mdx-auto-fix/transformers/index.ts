/**
 * All available transformers for MDX Auto-Fix
 */

export { lessThanDigitTransformer } from './less-than-digit';
export { greaterThanDigitTransformer } from './greater-than-digit';
export { invalidTagNamesTransformer } from './invalid-tag-names';
export { codeBlockLanguageTransformer } from './code-block-language';

import { lessThanDigitTransformer } from './less-than-digit';
import { greaterThanDigitTransformer } from './greater-than-digit';
import { invalidTagNamesTransformer } from './invalid-tag-names';
import { codeBlockLanguageTransformer } from './code-block-language';
import type { Transformer } from '../types';

/**
 * Default transformers that are enabled by default
 */
export const defaultTransformers: Transformer[] = [
  lessThanDigitTransformer,
  greaterThanDigitTransformer,
  invalidTagNamesTransformer,
  codeBlockLanguageTransformer,
];

/**
 * All available transformers (including opt-in ones)
 */
export const allTransformers: Transformer[] = [
  lessThanDigitTransformer,
  greaterThanDigitTransformer,
  invalidTagNamesTransformer,
  codeBlockLanguageTransformer,
];
