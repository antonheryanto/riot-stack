/* global rollup, fetch */
import stack from './rollup'
import { getScript } from './http'
export default roll

function browser (opts = {}) {
  return {
    resolveId (importee, importer) {
      if (!importer) return importee
      if (importee[0] !== '.') return `/node_modules/${importee}/src/index.js`
      if (importee[1] === '.') return importee.slice(2)
      const path = importer.split(/[\/\\]/)
      path[path.length - 1] = importee.slice(2)
      return path.join('/')
    },
    load (id) {
      if (id.slice(-5).indexOf('.') < 0) id += '.js'
      return fetch(id).then((r) => r.text())
    },
    writeBundle (b) {
      getScript(b.generate({
        moduleName: 'app',
        globals: {NProgress: 'NProgress', riot: 'riot'},
        format: 'iife'
      }).code, 'text')
    }
  }
}

function roll (entry) {
  Promise.all([
    'nprogress/nprogress.js',
    'rollup/dist/rollup.browser.js'
  ].map((v) => getScript('/node_modules/' + v))).then((a) => {
    const s = browser()
    rollup.rollup({entry: entry, plugins: [stack(), s]})
      .then(s.writeBundle).catch((e) => console.log(e))
  })
}
