import commonjs from '@rollup/plugin-commonjs'
import vue from 'rollup-plugin-vue'
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
    commonjs(),
    vue({
      css: true,
      compileTemplate: true
    }),
    buble()
  ]
}