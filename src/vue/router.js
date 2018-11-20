import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export function createRouter () {
  return new Router ({
    mode: 'history',
    routes: [
      { path: '/', component: () => import('./components/Bar.vue') },
      { path: '/item/:id', component: () => import('./components/Baz.vue') },
      { path: '/item/:id', component: () => import('./components/Foo.vue') }
    ]
  })
}