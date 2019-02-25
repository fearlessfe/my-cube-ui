<template>
<div class="wrapper">
  <scroll
          :data="data"
          :pullDownRefresh="pullDownRefresh"
          :pullUpLoad="pullUpLoad"
          @pullingDown="addData"
          @pullingUp="addData2">
    <ul class="content">
      <li v-for="item in data" :key="item.name">{{item.name}}</li>
    </ul>
  </scroll>
  <!-- <div class="animation-wrapper">
    <animation-loading @animation="handleAnimation"></animation-loading>
  </div> -->
</div>

</template>

<script>
  import BScroll from 'better-scroll'
  import scroll from 'components/scroll/scroll.vue'

  export default {
    data() {
      return {
        data: [],
        pullDownRefresh: {
          threshold: 50,
          stop: 75
        },
        pullUpLoad: {
          threshold: -50
        },
        animation: null
      }
    },
    components: {
      scroll
    },
    created() {
      this.loadData()
    },
    methods: {
      loadData() {
        for (let index = 0; index < 60; index++) {
          const element = {
            name: 'haha' + index
          };
          this.data.push(element)
        }
      },
      addData() {
        setTimeout(() => {
          this.data.push({
            name: new Date().getTime()
          })
        }, 2000)
      },
      addData2() {
        setTimeout(() => {

        }, 2000)
      }
    }
  }
</script>

<style lang="less" scoped>
  .wrapper {
    height: 100%;
    overflow: hidden;
    ul {
      margin: 0;
    }
  }
  .animation-wrapper {
    position: relative;
    text-align: center;
  }
</style>
