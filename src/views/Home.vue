<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <hello-world msg="Welcome to Your Vue.js App">
      <div slot="test">111</div>
      <div slot="test">222</div>
    </hello-world>
    <div v-for="number of data" :key="number">
      {{number}}
    </div>
    <button @click="handleClick">test</button>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'home',
  data() {
    return {
      data: [14, 15]
    }
  },
  watch: {
    data (newV) {
      console.log(newV)
    }
  },
  methods: {
    handleClick() {

    }
  },
  components: {
    HelloWorld
  },

}
</script>
