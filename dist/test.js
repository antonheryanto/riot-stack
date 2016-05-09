'use strict';

var test = require('tape');
test = 'default' in test ? test['default'] : test;
var riot = require('riot');

var api = '/api/'
function getBase () {
  return api
}

function setBase (path) {
  api = path
}

test('http base', (t) => {
  const expected = '/'
  setBase(expected)
  const actual = getBase()
  t.equal(actual, expected)
  t.end()
})