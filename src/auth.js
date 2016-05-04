/* global sessionStorage  */
import { get, post, remove } from './http'
import { trigger, route } from 'riot'
export { login, logout, current, validate }

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
