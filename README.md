# rollup-plugin-minifyliterals

Minify html in template literals using html-minifier. Tmeplate expressions are replaced with a placeholder before being minified. Supports nested templates in expresions.

Experimental support for minifying templates literals that have already been transpiled (i.e. string concatenation).

### Credits

This plugin was originally envisioned and created by [Terrence Tempest Wood](https://github.com/tmpst).

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
