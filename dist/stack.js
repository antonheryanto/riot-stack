import { route, trigger, mount, mixin, compile } from 'riot';
import { done, start } from 'NProgress';

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
    return Promise.reject('unauthorized')
  }
  const error = new Error(r.statusText)
  error.response = r
  throw error
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

  const opts = {method: 'post'}
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
  opts.headers = opts.header || {}
  const u = current()
  if (u.token) opts.headers['Authorization'] = `Bearer ${u.token}`

  return fetch(api + path, opts).then(valid).then(json)
}


var http = Object.freeze({
  getBase: getBase,
  setBase: setBase,
  query: query,
  getScript: getScript,
  get: get,
  post: post,
  remove: remove
});

function save (r) {
  if (!r || r.errors) return r || {}
  sessionStorage.setItem('user', JSON.stringify(r))
  trigger('login', r)
  route.exec()
  return r
}

function login (e) {
  return post('auth', e).then(save)
}

function logout (e) {
  sessionStorage.removeItem('user')
  trigger('logout')
  if (e) remove('auth')
}

function validate () {
  const u = current()
  if (u.token) return Promise.resolve(u)
  return get('auth').then(save)
}

function current (from) {
  const v = sessionStorage.getItem('user')
  return v ? JSON.parse(v) : {}
}


var auth = Object.freeze({
  login: login,
  logout: logout,
  current: current,
  validate: validate
});

function Index () {
  this.remove = function (e) {
    e.preventDefault()
    if (!confirm('Are you sure?')) return

    const m = e.item.m || e.item
    return remove(this.opts.api, {id: m.id}).then((r) => {
      if (!r || r.errors) return
      m._destroy = true
      this.update()
    })
  }
}

function Edit () {
  this.init = function () {
    this.model = this.opts.model || {}
    this.errors = {}
    this.validate = (e) => {
      const t = e.target
      const v = t.validity
      if (!t.name) return
      console.l
      this.model[t.name] = t.value
      if (v.valid) delete this.errors[t.name]
      if (v.valueMissing) this.errors[t.name] = 'is required'
      if (v.typeMismatch) this.errors[t.name] = 'type is mismatch'
      this.update()
    }
    document.addEventListener('change', this.validate)
    document.addEventListener('invalid', this.validate)
  }

  this.save = function (e) {
    e.preventDefault()
    const redirect = this.opts.redirect || this.opts.api
    if (Object.keys(this.errors).length > 0) return

    return post(this.opts.api, e.target).then((r) => {
      if (!r.errors) return route(redirect)

      this.errors = r.errors
      this.update()
    })
  }
}

// TODO opts => routes, authorizes
// TODO service without explicit service js
function router (opts) {
  const home = opts.home || 'home'
  const layout = opts.layout || 'layout'
  const services = opts.services || {}
  const main = opts.main || '#main'
  const wait = () => new Promise((resolve) => requestAnimationFrame(resolve))
  mixin('index', new Index())
  mixin('edit', new Edit())
  route.stop()
  route.base('/')
  route.start()
  route((c, a, i) => {
    c = c || home // default service
    const service = services[c]
    if (!service) return Promise.reject('service not found: ' + c)

    const p = route.query()
    if (a && a.indexOf('=') >= 0) a = undefined

    const id = a && parseInt(a, 10)
    if (id) {
      p.id = id
      a = i || 'details'
    }

    // parse action
    const action = a || 'index'
    const s = typeof service === 'function' ? service : service[action]
    const tag = a ? c + '-' + action : c
    if (!s) return Promise.reject('no action handler')

    // check service permission
    new Promise((resolve, reject) => {
      if (!service.AUTHORIZE) return resolve({name: 'anonymous'})

      validate().then((user) => {
        if (!user.token) {
          trigger('logout')
          return reject('please login')
        }

        trigger('login', user)
        resolve(user)
      }, (ex) => {
        trigger('logout')
        reject('validate problem: ' + ex)
      })
    // execute service action
    }).then((user) => {
      start()
      return s(p)
    }).then((r) => {
      if (!r) r = {}

      r.params = p
      r.action = action
      r.http = http
      return mount(main, tag, r)
    }).catch((e) => console.error('service error', e)).then((e) => {
      if (e && !e[0]) console.error('tag not found', e)

      done()
    })
  })

  wait(mount(layout, {
    navs: opts.navs,
    auth
  })).then(route.exec)
}

export { login, logout, current, validate, getBase, setBase, query, getScript, get, post, remove, Index, Edit, router };