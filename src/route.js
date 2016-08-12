/* global requestAnimationFrame */
import { trigger, mixin, route, mount } from 'riot'
import { start, done } from 'NProgress'
import * as http from './http'
import * as auth from './auth'
import { Index, Edit } from './crud'

// TODO opts => routes, authorizes
// TODO service without explicit service js
export function router (opts) {
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

      auth.validate().then((user) => {
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
      return Promise.resolve(s(p))
    }).then((r) => {
      if (!r) r = {}
      r.user = auth.current()
      r.params = p
      r.action = action
      r.http = http
      return mount(main, tag, r)
    }).catch((e) => console.error(tag, 'service error', e)).then((e) => {
      if (e && !e[0]) console.error('tag', tag, 'not found', e)

      done()
    })
  })

  wait(mount(layout, {
    navs: opts.navs,
    auth
  })).then(route.exec)
}
