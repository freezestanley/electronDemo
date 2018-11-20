<template>
  <div>this is Item.vue
    <div>{{item.title}}</div>
  </div>
</template>
<script>
export default {
  asyncData ({store, route}) {
    return store.dispatch('fetchItem', route.params.id)
  },
  computed: {
    item () {
      return this.$store.state.items.title
    }
  },
  data () {
    return {

    }
  }
}
</script>
