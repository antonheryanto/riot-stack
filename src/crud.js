/* global confirm */
import { route } from 'riot'
import { post, remove } from './http'
export { Index, Edit }

function Index () {
  this.remove = function (e) {
    e.preventDefault()
    if (!confirm('Are you sure?')) return

    const m = e.item.m || e.item
    return remove(this.opts.api, {id: m.id}).then((r) => {
      if (!r) return
      m._destroy = !r.error
      this.error = r.error
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
      if (!t.name) return
      this.model[t.name] = t.value
      if (t.checkValidity()) delete this.errors[t.name]
      else this.errors[t.name] = t.validationMessage
      this.update()
    }
    document.addEventListener('change', this.validate)
    document.addEventListener('invalid', this.validate)
  }

  this.save = function (e) {
    e.preventDefault()
    const t = e.target
    const redirect = this.opts.redirect || this.opts.api
    if (Object.keys(this.errors).length > 0) return

    return post(this.opts.api, t).then((r) => {
      if (!r.errors) return route(redirect)

      this.errors = r.errors
      this.update()
    })
  }
}
