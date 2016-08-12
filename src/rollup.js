import { compile } from 'riot'

export default function stack (opts = {}) {
  return {
    transform (code, id) {
      if (id.indexOf('.html') < 0) return code
      const o = compile(code).replace(/riot\.tag2/g, 'tag2')
      return {
        code: `import { tag2 } from 'riot'\n ${o}`,
        map: { mappings: '' }
      }
    },
    options (o) {
      o.external = ['riot', 'NProgress']
    },
    intro () {
      return 'riot.observable(riot)\n'
    }
  }
}
