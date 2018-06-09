**:rotating_light: WARNING: The npm package and active development has been moved to [Festify/rollup-plugin-minifyliterals](https://github.com/Festify/rollup-plugin-minifyliterals). This repository is no longer maintained.**

# rollup-plugin-minifyliterals

Minify html in template literals using html-minifier.

Experimental support for minifying templates literals that have already been transpiled (i.e. string concatenation).


## Installation

```sh
npm install --save-dev rollup-plugin-minifyliterals
```


## Usage

For best results run before transpiling to es5. This will allow you to send
extra options to through to html-minifier.


```js
// rollup.config.js
import minifyliterals from 'rollup-plugin-minifyliterals'
import buble from 'buble'

export default {
  entry: 'src/index.js',
  dest: 'dist/my-lib.js',
  plugins: [
    minifyliterals({
      // set this to `false` if you're not using sourcemaps –
      // defaults to `true`
      sourceMap: true,
      // optionally pass through options to html-minifier -
      // defaults to `{ collapseWhitespace: true }`
      htmlminifier: {
        removeRedundantAttributes: true
      },
      // optionally process transpiled template literals -
      // defaults to false (experimental, not widely tested)
      literals: true
    }),
    buble()
  ]
}

```


## License

MIT
