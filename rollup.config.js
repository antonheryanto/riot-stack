export default {
  dest: 'dist/stack.js',
  entry: 'src/index.js',
  moduleName: 'stack',
  external: ['riot', 'NProgress'],
  globals: {riot: 'riot', NProgress: 'NProgress'}
}
