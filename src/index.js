import { extname } from 'path'
import acorn from 'acorn'
import { walk } from 'estree-walker'
import MagicString from 'magic-string'
import { createFilter } from 'rollup-pluginutils'
import { minify } from 'html-minifier'
import { MinifyTemplate } from "./minify-templates";

const htmlminifier = {
  collapseWhitespace: true
}

const defaultoptions = {
  htmlminifier: htmlminifier,
  literals: false,
  includeExtension: ['.js']
}

export default function minifyliterals (options = {}) {
  const filter = createFilter(options.include, options.exclude)
  const sourceMap = options.sourceMap !== false

  options = Object.assign(defaultoptions, options)

  return {
    name: 'minifyliterals',

    transform (code, id) {
      if (!filter(id) || options.includeExtension.indexOf(extname(id)) === -1) {
        return;
      }

      let ast

      try {
        ast = acorn.parse(code, {
          ecmaVersion: 6,
          sourceType: 'module'
        })
      } catch (err) {
        err.message += ` in ${id}`
        throw err
      }

      const magicString = new MagicString(code)
      const minifyTemplates = new MinifyTemplate(code, magicString, options.htmlminifier)
      let edited = false

      walk(ast, {
        enter (node) {
          let value = ''
          let transformed = ''
          if (sourceMap) {
            magicString.addSourcemapLocation(node.start)
            magicString.addSourcemapLocation(node.end)
          }

          minifyTemplates.enter(node);

          if (node.type === 'Literal' && options.literals !== false) {
            value = node.raw
            // only process multiple white space characters
            // and literal new lines
            if (/\\n|(\s{2})/.test(value)) {
              value = value.replace(/\\n/g, ' ')
              try {
                transformed = minify(value, options.htmlminifier)
              } catch (err) {
                // incomplete element
                transformed = value.replace(/\s+/g, ' ').replace(/> </g, '><').trim()
                // console.log('reset incommplete element', transformed)
              }

              // closing tags have been discarded
              if (transformed.replace(/["'\s]/g, '').length === 0) {
                transformed = value.replace(/\s+/g, '')
                // console.log('reset discarded closing tag', transformed)
              }

              // open/close tags have been transposed, or open tag closed early
              if (/<([^>]+)>['"]<\/\1>/.test(transformed)) {
                transformed = value.replace(/\s+/g, ' ')
                // console.log('reset early close / transposed start tag', transformed)
              }
            } else {
              transformed = value
            }
          }

          if (value !== transformed) {
            edited = true
            magicString.overwrite(node.start, node.end, transformed)
          }
        },

        leave (node) {
          minifyTemplates.leave(node);
        }
      })

      edited = edited || minifyTemplates.edited

      if (!edited) return null
      code = magicString.toString()
      const map = sourceMap ? magicString.generateMap() : null
      return {code, map}
    }
  }
}
