import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
export function createStore () {
  return new Vuex.Store({
    state: {
      items: {}
    },
    actions: {
      fetchItem ({ commit }, id) {
        commit('setItem', { id: 123123, items: [
          { name: 'aaa'},
          { name: 'bbb'}
        ] })
      }
    },
    mutations: {
      setItem (state, {id, items}) {
        Vue.set(state.items, id, items)
      }
    }
  })
}