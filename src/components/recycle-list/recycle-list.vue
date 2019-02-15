<template>
  <div class="sky-recycle-list">
    <div class="sky-recycle-list-main">
      <div class="sky-recycle-list-items" :style="{height: heights + 'px'}">
        <div class="sky-recycle-list-item" v-for="(item, index) in visibleItems" :key="index" :style="{transform: 'translate(0,' + item.top + 'px)'}">
          <!-- <div v-if="infinite" :class="{'sky-recycle-list-transition': infinite}" :style="{opacity: +!item.loaded}">
            <slot name="tombstone"></slot>
          </div> -->
          <div :class="{'sky-recycle-list-transition': infinite}" :style="{opacity: item.loaded}">
            <slot name="item" :data="item.data"></slot>
          </div>
        </div>
        <!-- preloads item for get its height, remove it after caculating height-->
        <div class="sky-recycle-list-pool">
          <div class="sky-recycle-list-item sky-recycle-list-invisible"  v-for="(item, index) in items" v-if="!item.isTombstone && !item.height" :ref="'preloads'+index" :key="index">
            <slot name="item" :data="item.data"></slot>
          </div>
          <div ref="tomb" class="sky-recycle-list-item sky-recycle-list-invisible">
            <slot name="tombstone"></slot>
          </div>
        </div>
      </div>
      <div class="sky-recycle-list-loading" v-if="!infinite">
        <slot name="spinner">
          <div class="sky-recycle-list-loading-content">
            <cube-loading class="spinner"></cube-loading>
          </div>
        </slot>
      </div>
      <div class="sky-recycle-list-noMore">
        <slot name="noMore" />
      </div>
    </div>
    <div class="sky-recycle-list-fake"></div>
  </div>
</template>

<script>

  import { warn } from '../../common/helpers/debug.js'
  import { isUndef } from '../../common/helpers/util.js'

  const COMPONENT_NAME = 'cube-recycle-list'
  const PROMISE_ERROR = 'requires a Promise polyfill in this browser.'
  const EVENT_SCROLL = 'scroll'
  const EVENT_RESIZE = 'resize'

  export default {
    name: COMPONENT_NAME,
    data() {
      return {
        items: [],
        list: [], // 总的数据列表
        heights: 0,
        startIndex: 0,
        loadings: [],
        startOffset: 0,
        noMore: false
      }
    },
    props: {
      infinite: {
        type: Boolean,
        default: false
      },
      size: {
        type: Number,
        default: 20
      },
      // 底部拉取更多数据的距离
      offset: {
        type: Number,
        default: 100
      },
      onFetch: {
        type: Function,
        required: true
      }
    },
    computed: {
      visibleItems() {
        return this.items.slice(Math.max(0, this.startIndex - this.size), Math.min(this.items.length, this.startIndex + this.size))
      },
      tombHeight() {
        return this.infinite ? this.$refs.tomb && this.$refs.tomb.offsetHeight : 0
      },
      loading() {
        return this.loadings.length
      }
    },
    watch: {
      list (newV) {
        if (newV.length) {
          this.loadings.pop()
          if (!this.loading) {
            this.loadItems()
          }
        }
      },
      items (newV) {
        if (newV.length > this.list.length) {
          this.getItems()
        }
      }
    },
    created () {
      this.checkPromiseCompatibility()
    },
    mounted() {
      this.$el.addEventListener(EVENT_SCROLL, this._onScroll)
      window.addEventListener(EVENT_RESIZE, this._onResize)
      this.init()
    },
    beforeDestroy() {
      this.$el.removeEventListener(EVENT_SCROLL, this._onScroll)
      window.removeEventListener(EVENT_RESIZE, this._onResize)
    },
    methods: {
      checkPromiseCompatibility () {
        if (isUndef(Window.Promise)) {
          warn(PROMISE_ERROR)
        }
      },
      init() {
        this.load()
      },
      load() {
        if(this.infinite) {
          // increase capacity of items to display tombstone
          this.items.length += this.size
          this.loadItems()
        } else if (!this.loading) {
          this.getItems()
        }
      },
      getItems() {
        this.loadings.push('pending')
        this.onFetch().then(res => {
          if (!res) {
            this.noMore = true
            this.loadings.pop()
          } else {
            this.list = this.list.concat(res)
          }
        })
      },
      loadItems(isResize) {
        let promiseTasks = []
        let start = 0
        let end = this.infinite ? this.items.length : this.list.length
        let item
        for (let i = start; i < end; i++) {
          item = this.items[i]
          if(item && item.loaded) {
            continue
          }
          this.setItem(i, this.list[i])
          // get each item's height in nextTick
          promiseTasks.push(this.$nextTick().then(() => {
            this.updateItemHeight(i)
          }))
        }
        // update items top and full list height
        window.Promise.all(promiseTasks).then(() => {
          this.updateItemTop()
        })
      },
      // 将list中的数据放入items中，增加一些自定义的属性
      setItem(index, data) {
        this.$set(this.items, index, {
          data: data || {},
          height: 0,
          top: -1000,
          isTombstone: !data,
          loaded: data ? 1 : 0
        })
      },
      updateItemHeight(index) {
        let cur = this.items[index]
        let dom = this.$ref['preloads' + index]
        if(dom && dom[0]) {
          cur.height = dom[0].offsetHeight
        } else {
          // tombstone
          cur.height = this.tombHeight
        }
      },
      updateItemTop() {
        // loop all items to update item top and list height
        this.heights = 0
        for (let i = 0; i < this.items.length; i++) {
          let pre = this.items[i-1]
          this.items[i].top = pre ? pro.top + pre.height : 0
          this.heights += this.items[i].height
        }
        // update scroll top when needed
        if(this.startOffset) {
          this.setScrollTop()
        }
        this.updateIndex()
      },
      updateIndex() {
        let top = this.$el.scrollTop
        for (let i = 0; i < this.item.length; i++) {
          if(this.items[i].top > top) {
            this.startIndex = Math.max(0, i - 1)
            break
          }
        }
      },
      getStartItemOffset() {
        if (this.items[this.startIndex]) {
          this.startOffset = this.items[this.startIndex].top - this.$el.scrollTop
        }
      },
      setScrollTop() {
        if (this.items[this.startIndex]) {
          this.$el.scrollTop = this.items[this.startIndex].top - this.startOffset
          // reset start item offset
          this.startOffset = 0
        }
      },
      _onScroll() {
        // trigger load
        if (this.$el.scrollTop + this.$el.offsetHeight > this.heights - this.offset) {
          this.load()
        }
        this.updateIndex()
      },
      _onResize() {
        this.getStartItemOffset()
        this.items.forEach((item) => {
          item.loaded = false
        })
        this.loadItems(true)
      }
    }
  }
</script>
<style lang="less" scoped>
  .sky-recycle-list {
    position: relative;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
  .sky-recycle-list-main {
    min-height: 100%;
  }
  .sky-recycle-list-fake {
    height: 1px;
  }
  .sky-recycle-list-invisible {
    top: -1000px;
    visibility: hidden;
  }
  .sky-recycle-list-item {
    width: 100%;
    position: absolute;
    box-sizing: border-box;
  }
  .sky-recycle-list-transition {
    position: absolute;
    opacity: 0;
    transition-property: opacity;
    transition-duration: 500ms;
  }
  .sky-recycle-list-loading {
    overflow: hidden;
  }
</style>
