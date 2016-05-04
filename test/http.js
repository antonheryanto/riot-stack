import test from 'tape'
import * as http from '../src/http'

test('http base', (t) => {
  const expected = '/'
  http.setBase(expected)
  const actual = http.getBase()
  t.equal(actual, expected)
  t.end()
})
