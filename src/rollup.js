import { compile } from 'riot'

export default function stack (opts = {}) {
  return {
    transform (code, id) {
      if (id.indexOf('.html') < 0) return code
      const o = compile(code).replace(/riot./g, '')
      return `import { route, tag2, on, mount } from 'riot'\n ${o}`
    },
    transformBundle (code) {
      return `${code}\n//# sourceURL=${opts.name}`
    },
    options (o) {
      o.external = ['riot', 'NProgress']
      opts.name = o.entry.split('/').pop()
    },
    intro () {
      return 'riot.observable(riot)\n'
    }
  }
}
