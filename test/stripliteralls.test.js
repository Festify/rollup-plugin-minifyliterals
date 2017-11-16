const fs = require('fs')
const test = require('ava')
const minifyliterals = require('..')

const transform = (input, options = {}) => minifyliterals(options).transform(file(input), 'input.js')
const file = (name) => fs.readFileSync(`fixtures/${name}`, 'utf-8')
const compare = (name, options = {}) => {
  return {
    actual: transform(`${name}/input.js`, options).code || file(`${name}/input.js`),
    expected: file(`${name}/output.js`)
  }
}

const extraoptions = {
  literals: true
}

test('removes whitespace from TemplateElement nodes', t => {
  let { actual, expected } = compare('template-element')
  t.deepEqual(actual, expected)
})

test('removes whitespace from Literal nodes', t => {
  let { actual, expected } = compare('literal', extraoptions)
  t.deepEqual(actual, expected)
})

test('handles nested templates correctly', t => {
    let { actual, expected } = compare('literal', extraoptions)
    t.deepEqual(actual, expected)
})

test('returns null if no changes were made', t => {
  t.is(transform('ast/output.js'), null)
})

test('returns code if changes were made', t => {
  t.true('code' in transform('literal/input.js'))
})

test('throws if there is not a valid ast', t => {
  t.throws(() => transform('ast/input.js'))
  t.notThrows(() => transform('ast/output.js'))
})
