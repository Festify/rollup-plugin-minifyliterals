import buble from 'rollup-plugin-buble'

export default {
  entry: 'src/index.js',
  // plugins: [ buble() ],
  targets: [
    {
      format: 'cjs',
      dest: 'dist/rollup-plugin-minifyliterals.cjs.js'
    },
    {
      format: 'es',
      dest: 'dist/rollup-plugin-minifyliterals.es.js'
    }
  ]
}
