import { svelte } from '@sveltejs/vite-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve'; // This resolves NPM modules from node_modules.
import preprocess from 'svelte-preprocess';
import { postcssConfig, terserConfig } from '@typhonjs-fvtt/runtime/rollup';

const s_PACKAGE_ID = 'modules/fates-descent';
const s_SVELTE_HASH_ID = 'fdcss';
const s_COMPRESS = false; // Set to true to compress the module bundle.
const s_SOURCEMAPS = true; // Generate sourcemaps for the bundle (recommended).

const s_RESOLVE_CONFIG = {
  browser: true,
  dedupe: ['svelte']
};

export default () =>
  /** @type {import('vite').UserConfig} */
  ({
    root: 'src/',
    base: `/${s_PACKAGE_ID}/`,
    publicDir: false,
    cacheDir: '../.vite-cache',

    resolve: { conditions: ['import', 'browser'] },

    esbuild: {
      target: ['es2022']
    },

    css: {
      postcss: postcssConfig({ compress: s_COMPRESS, sourceMap: s_SOURCEMAPS })
    },

    server: {
      port: 30001,
      open: '/game',
      proxy: {
        [`^(/${s_PACKAGE_ID}/(assets|lang|packs|style.css))`]: 'http://localhost:30000',
        [`^(?!/${s_PACKAGE_ID}/)`]: 'http://localhost:30000',
        '/socket.io': { target: 'ws://localhost:30000', ws: true }
      }
    },

    build: {
      outDir: __dirname,
      emptyOutDir: false,
      sourcemap: s_SOURCEMAPS,
      brotliSize: true,
      minify: s_COMPRESS ? 'terser' : false,
      target: ['es2022'],
      terserOptions: s_COMPRESS ? { ...terserConfig(), ecma: 2022 } : void 0,
      lib: {
        entry: 'main.js',
        formats: ['es'],
        fileName: 'fates-descent'
      }
    },

    optimizeDeps: {
      esbuildOptions: {
        target: 'es2022'
      }
    },

    plugins: [
      svelte({
        compilerOptions: {
          cssHash: ({ hash, css }) => `svelte-${s_SVELTE_HASH_ID}-${hash(css)}`
        },
        preprocess: preprocess()
      }),

      resolve(s_RESOLVE_CONFIG)
    ]
  });
