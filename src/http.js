/* global fetch, FormData, HTMLElement */
import { current, logout } from './auth'
export { getBase, setBase, query, getScript, get, post, remove }

var api = '/api/'
const TYPE = 'application/json'

function getBase () {
  return api
}

function setBase (path) {
  api = path
}

function valid (r) {
  if (r.status > 199 && r.status < 300) return r
  if (r.status === 401) {
    logout()
    return Promise.reject('not authenticated')
  }
  console.error(r.status, r.statusText)
  return r
  // FIXME send to log manager
  // const error = new Error(r.statusText)
  // error.response = r
  // throw error
}

function query (arg) {
  const parts = []
  for (var i in arg) {
    if (arg.hasOwnProperty(i)) {
      parts.push(encodeURIComponent(i) + '=' + encodeURIComponent(arg[i]))
    }
  }
  return parts.length ? '?' + parts.join('&') : ''
}

function getScript (value, attr = 'src') {
  const doc = document
  return new Promise((resolve) => {
    const script = doc.createElement('script')
    script.onload = resolve
    script[attr] = value
    doc.body.appendChild(script)
    doc.body.removeChild(script)
  })
}

function json (r) {
  if (r.headers.get('Content-Type') === TYPE) return r.json()
}

function get (url, arg) {
  if (arg) url += query(arg)
  return req(url)
}

function post (url, data) {
  if (!data) return Promise.reject('no data provided')

  const opts = {method: 'post', headers: {}}
  if (data instanceof HTMLElement) {
    opts.body = new FormData(data)
  } else {
    opts.body = JSON.stringify(data)
    opts.headers['Accept'] = TYPE
    opts.headers['Content-Type'] = TYPE
    opts.headers['Content-Length'] = opts.body ? opts.body.length : 0
  }

  return req(url, opts)
}

function remove (url, arg) {
  if (arg) url += query(arg)
  return req(url, {method: 'DELETE'})
}

function req (path, opts = {}) {
  opts.credentials = 'same-origin'
  opts.headers = opts.headers || {}
  const u = current()
  if (u.token) opts.headers['Authorization'] = `Bearer ${u.token}`

  return fetch(api + path, opts).then(valid).then(json)
}
