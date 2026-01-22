import * as esbuild from 'esbuild';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

/**
 * Plugin that injects CSS into the document at runtime.
 * Converts CSS imports into JS that creates a <style> tag.
 */
const injectCSSPlugin = {
  name: 'inject-css',
  setup(build) {
    // Resolve @mdxeditor/editor/style.css from node_modules
    build.onResolve({ filter: /^@mdxeditor\/editor\/style\.css$/ }, (args) => {
      const cssPath = resolve(rootDir, 'node_modules/@mdxeditor/editor/dist/style.css');
      if (existsSync(cssPath)) {
        return { path: cssPath };
      }
      // Fallback: try without /dist
      const altPath = resolve(rootDir, 'node_modules/@mdxeditor/editor/style.css');
      if (existsSync(altPath)) {
        return { path: altPath };
      }
      return { external: true };
    });

    build.onLoad({ filter: /\.css$/ }, async (args) => {
      const css = readFileSync(args.path, 'utf8');

      // Create a simple hash for deduplication based on file path
      const hash = Buffer.from(args.path).toString('base64').slice(0, 8);
      const idPrefix = args.path.includes('mdxeditor') ? 'mdxeditor-base' : 'industry-mdx-editor';

      // Generate JS that injects the CSS once
      const js = `
(function() {
  if (typeof document === 'undefined') return;
  var id = '${idPrefix}-styles-${hash}';
  if (document.getElementById(id)) return;
  var style = document.createElement('style');
  style.id = id;
  style.textContent = ${JSON.stringify(css)};
  document.head.appendChild(style);
})();
`;
      return {
        contents: js,
        loader: 'js',
      };
    });
  },
};

async function build() {
  try {
    await esbuild.build({
      entryPoints: [resolve(rootDir, 'index.ts')],
      bundle: true,
      format: 'esm',
      outfile: resolve(rootDir, 'dist/index.mjs'),
      external: [
        'react',
        'react-dom',
        '@mdxeditor/editor',
        '@principal-ade/industry-theme',
        'remark',
        'remark-mdx',
        'unist-util-visit',
        'mdast',
        '@codemirror/state',
        '@codemirror/view',
      ],
      plugins: [injectCSSPlugin],
      minify: false,
      sourcemap: true,
    });

    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
