import typescript from "rollup-plugin-typescript";
import buble from "rollup-plugin-buble";

export default {
  entry: 'src/index.ts',
  external: [],
  plugins: [
    typescript({tsconfig: false}),
    buble()
  ],
  targets: [
    {dest: 'lib/mighty-xhr-layer.cjs.js', format: 'cjs', sourceMap: true},
    {dest: 'lib/mighty-xhr-layer.umd.js', format: 'umd', sourceMap: true, moduleName: "mighty-xhr-layer"},
    {dest: 'lib/mighty-xhr-layer.es6.js', format: 'es', sourceMap: true}
  ]
}
