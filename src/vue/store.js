import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
import { fetchItem } from './api'

export function createStore () {
  return new Vuex.Store({
    state: {
      items: {}
    },
    actions: {
      // fetchItem ( { commit }, id) {
      //   return fetchItem(id).then(item => {
      //     commit('setItem', { id, item })
      //   })
      // }
      fetchitem ( { commit }) {
        return commit('setItem', {id: '123123', item: 'this is item'})
      }
    },
    mutations: {
      setItem (state, {id, item}) {
        Vue.set(state.items, id, item)
      }
    }
  })
}