import svelte from "rollup-plugin-svelte";
import externals from 'rollup-plugin-node-externals'
import css from 'rollup-plugin-css-only'
import { VERSION } from './src/version'

const production = VERSION.production

export default [
  {
    input: [
            "src/main.js",
            "src/index.js"
           ],
    output: [
      {
        sourcemap: !production,
        dir: "build",
        format: "cjs",
      }
    ],
    plugins: [
      svelte({
        compilerOptions: {
          dev: VERSION.production
        },
        onwarn: (warning, handler) => {
          // if (warning.code === 'a11y-label-has-associated-control') return;
          handler(warning);
        }
      }),
      externals({deps: true}),
      css({output: 'bundle.css'})
    ],
    onwarn (warning, warn) {
      if (warning.code === 'CIRCULAR_DEPENDENCY') return;
      warn(warning);
    }
  }
];
