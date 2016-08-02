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
