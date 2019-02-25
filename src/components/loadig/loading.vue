<template>
  <div ref="wrapper" class="loading-wrapper">

  </div>
</template>

<script>
  import lottie from 'lottie-web'

  const COMPONENT_NAME = 'animation-loading'
  export default {
    name: COMPONENT_NAME,
    data() {
      return {
        animation:null
      }
    },
    props: {
      // 动画文件名
      filename: {
        type: String,
        default: 'data-orange.json'
      },
      // 下拉刷新时触发动画
      play: {
        type: Boolean,
        default: false
      }
    },
    mounted() {
      const el = this.$refs.wrapper
      this.animation = lottie.loadAnimation({
        container: el,
        renderer: 'html',
        loop: true,
        autoplay: false,
        path: `./lottie-animation/${filename}.json`
      })
    },
    destroyed() {
      this.animation && this.animation.destroy()
      this.animation = null
    },
    watch:{
      play: function(newVal) {
        if(newVal) {
          this.animation.play()
        } else {
          setTimeout(() => {
            this.animation.stop()
          }, 1000);
        }
      }
    }
  }
</script>

<style lang="less" scoped>
  .loading-wrapper {
    position: relative;
    display: inline-block;
    height: 68px;
    width: 68px;
    line-height: 68px;
  }
</style>
