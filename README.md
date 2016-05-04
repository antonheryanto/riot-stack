Riot Stack
==========

lua-resty-stack style framework for client side apps and uses riot as view
* using es6 module bundle using rollup
* using es6 syntax
* using promise
* using fetcth
* routing using riot.route

Licence: MIT

How to use
----------
Please run on webserver as fetch restrict direct file access

```html
<!DOCTYPE html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1.0">
  <title>Riot Stack Sample</title>
</head>
<body>
  <div data-is="layout"></div>

  <script src="/node_modules/riot/riot+compiler.js"></script>
  <script src="/node_modules/riot-stack/dist/browser.js"></script>
  <script>stack('/js/app.js')</script>
</body>
</html>
```

/js/app.js
```js
// tag
import '../tag/layout.html'
import '../tag/home.html'
// presenter
import { router } from 'riot-stack'

export default router({
  services: {
    'home': {
      index (p) {
        return { message: 'Hello Riot Stack' }
      }
    }
  }
})
```
/tag/layout.html
```html
<layout>
  <h1>Layout of Apps</h1>
  <div id="main"></div>
</layout>
```
/tag/home.html
```html
<home>
  <h1>{opts.message}</h1>
</home>
```



