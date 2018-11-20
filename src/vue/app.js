import Vue from 'vue'
import App from 'App.vue'
import { createRouter } from './router'
import { createStore } from './store'
import { sync } from 'vuex-router-sync'

export function createApp (context) {
  const router = createRouter()
  const store = createStore()
  sync(store, router)

  const app = new Vue({
    data: {
      url: context.url
    },
    store,
    router,
    render: h => h(app)
  })
  return { app, router, store }
}

// module.exports = function createApp (context) {
//   return new Vue({
//     data: {
//       url: context.url
//     },
//     template: `<div>访问的 URL 是： {{ url }}</div>`
//   })
// }