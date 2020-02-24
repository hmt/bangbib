import svelte from "rollup-plugin-svelte";
import externals from 'rollup-plugin-node-externals'

const production = process.env.NODE_ENV !== "development";

export default [
  {
    input: [
            "src/main.js",
            "src/index.js"
           ],
    output: [
      {
        sourcemap: true,
        dir: "build",
        format: "cjs",
      }
    ],
    plugins: [
      svelte({
        dev: !production,
        css: css => {
          css.write("build/bundle.css");
        },
      }),
      externals({deps: true})
    ],
    onwarn (warning, warn) {
      if (warning.code === 'CIRCULAR_DEPENDENCY') return;
      warn(warning);
    }
  }
];
