import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import vue from 'rollup-plugin-vue'
import babel from '@rollup/plugin-babel'
import buble from '@rollup/plugin-buble'
import { terser } from 'rollup-plugin-terser'

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/index.esm.js',
      name: 'Omnibox',
      exports: 'named',
      format: 'esm'
    },
    {
      file: 'dist/index.esm.min.js',
      name: 'Omnibox',
      exports: 'named',
      format: 'esm',
      plugins: [ terser() ]
    }
  ],
  plugins: [
    vue({
      css: true,
      compileTemplate: true
    }),
    babel({
      exclude: 'node_modules/**',
      babelHelpers: 'runtime',
      extensions: ['.js', '.jsx', '.es6', '.es', '.mjs', '.vue']
    }),
    resolve(),
    commonjs(),
    buble()
  ]
}