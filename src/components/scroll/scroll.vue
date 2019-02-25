<template>
  <div ref="wrapper" class="cube-scroll-wrapper">
    <div class="cube-scroll-content">
      <div ref="listWrapper" class="cube-scroll-list-wrapper">
        <slot>
          <ul class="cube-scroll-list">
            <li
              class="cube-scroll-item border-bottom-1px"
              v-for="(item, index) in data"
              :key="index"
              @click="clickItem(item)">{{item}}</li>
          </ul>
        </slot>
      </div>
      <slot name="pullup" :pullUpLoad="pullUpLoad" :isPullUpLoad="isPullUpLoad">
        <div class="cube-pullup-wrapper" v-if="pullUpLoad">
          <div class="before-trigger" v-if="!isPullUpLoad">
            <span>{{ pullUpTxt }}</span>
          </div>
          <div class="after-trigger" v-else>
            <animation-loading :play="isPullingDown"></animation-loading>
          </div>
        </div>
      </slot>
    </div>
    <div v-if="pullDownRefresh" class="cube-pulldown" ref="pulldown">
      <slot
        name="pulldown"
        :pullDownRefresh="pullDownRefresh"
        :pullDownStyle="pullDownStyle"
        :beforePullDown="beforePullDown"
        :isPullingDown="isPullingDown"
        :bubbleY="bubbleY">
        <div class="cube-pulldown-wrapper" :style="pullDownStyle">
          <div class="before-trigger" v-show="beforePullDown">
            <span>加载更多</span>
          </div>
          <div class="after-trigger" v-show="!beforePullDown">
            <div v-show="isPullingDown" class="loading">
              <animation-loading :play="isPullingDown"></animation-loading>
            </div>
            <div v-show="!isPullingDown" class="cube-pulldown-loaded"><span>{{ refreshTxt }}</span></div>
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>

<script>
  import BScroll from 'better-scroll'
  import scrollMixin from '../../common/mixins/scroll'
  import deprecatedMixin from '../../common/mixins/deprecated'
  import AnimationLoading from '../loadig/loading.vue'
  import { getRect } from '../../common/helpers/dom'
  import { camelize } from '../../common/lang/string'

  const COMPONENT_NAME = 'sky-scroll'
  const DIRECTION_H = 'horizontal'
  const DIRECTION_V = 'vertical'
  const DEFAULT_REFRESH_TXT = '加载成功'
  const DEFAULT_STOP_TIME = 600

  const EVENT_CLICK = 'click'
  const EVENT_PULLING_DOWN = 'pulling-down'
  const EVENT_PULLING_UP = 'pulling-up'

  const EVENT_SCROLL = 'scroll'
  const EVENT_BEFORE_SCROLL_START = 'before-scroll-start'
  const EVENT_SCROLL_END = 'scroll-end'

  const NEST_MODE_NONE = 'none'
  const NEST_MODE_NATIVE = 'native'

  const SCROLL_EVENTS = [EVENT_SCROLL, EVENT_BEFORE_SCROLL_START, EVENT_SCROLL_END]

  const DEFAULT_OPTIONS = {
    observeDOM: true,
    click: true,
    probeType: 1,
    scrollbar: false,
    pullDownRefresh: false,
    pullUpLoad: false
  }

  export default {
    name: COMPONENT_NAME,
    mixins: [scrollMixin, deprecatedMixin],
    provide() {
      return {
        parentScroll: this
      }
    },
    inject: {
      parentScroll: {
        default: null
      }
    },
    props: {
      data: {
        type: Array,
        default() {
          return []
        }
      },
      scrollEvents: {
        type: Array,
        default() {
          return []
        },
        validator(arr) {
          return arr.every((item) => {
            return SCROLL_EVENTS.indexOf(item) !== -1
          })
        }
      },
      // TODO: plan to remove at 1.10.0
      listenScroll: {
        type: Boolean,
        default: undefined,
        deprecated: {
          replacedBy: 'scroll-events'
        }
      },
      listenBeforeScroll: {
        type: Boolean,
        default: undefined,
        deprecated: {
          replacedBy: 'scroll-events'
        }
      },
      direction: {
        type: String,
        default: DIRECTION_V
      },
      refreshDelay: {
        type: Number,
        default: 20
      },
      nestMode: {
        type: String,
        default: NEST_MODE_NONE
      }
    },
    data() {
      return {
        beforePullDown: true,
        isPullingDown: false,
        isPullUpLoad: false,
        pullUpDirty: true,
        pullDownStyle: '',
        pullDownStop: 40,
        pullDownHeight: 60
      }
    },
    computed: {
      pullDownRefresh() {
        let pullDownRefresh = this.options.pullDownRefresh
        if (!pullDownRefresh) {
          return pullDownRefresh
        }
        if (pullDownRefresh === true) {
          pullDownRefresh = {}
        }
        return Object.assign({stop: this.pullDownStop}, pullDownRefresh)
      }
    },
    watch: {
      data() {
        setTimeout(() => {
          this.forceUpdate(true)
        }, this.refreshDelay)
      }
    },
    methods: {
      initScoll() {
        if(!this.$refs.wrapper) {
          return
        }
        this._calculateMinHeight()

        let options = Object.assign({}, DEFAULT_OPTIONS, {
          scrollY: this.direction === DIRECTION_V,
          scrollX: this.direction === DIRECTION_H,
          probeType: this.needListenScroll ? 3 : 1
        }, this.options)

        this.scroll = new BScroll(this.$refs.wrapper, options)

        this.parentScroll && this.nestMode !== NEST_MODE_NONE && this._handleNestScroll()

        this._listenScrollEvents()

        if(this.pullDownRefresh) {
          this._getPullDownEleHeight()
          this._onPullDownRefresh()
        }

        if(this.pullUpLoad) {
          this._onPullUpLoad()
        }
      },
      _listenScrollEvents() {
        this.finalScrollEvents.forEach((event) => {
          this.scroll.on(camelize(event), (...args) => {
            this.$emit(event, ...args)
          })
        })
      },
      _handleNestScroll() {
        this.$nextTick(() => {
          const innerScroll = this.scroll
          const outerScroll = this.parentScroll.scroll
          const scrolls = [innerScroll, outerScroll]
          scrolls.forEach((scroll, index, arr) => {
            scroll.on('touchEnd', () => {
              outerScroll.enable()
              innerScroll.enable()
              // when inner scroll reaching boundary, we will disable inner scroll, so when 'touchend' event fire,
              // the inner scroll will not reset initiated within '_end' method in better-scroll.
              // then lead to inner and outer scrolls together when we touch and move on the outer scroll element,
              // so here we reset inner scroll's 'initiated' manually.
              innerScroll.initiated = false
            })

            scroll.on('beforeScrollStart', () => {
              this.touchStartMoment = true
              const anotherScroll = arr[(index + 1) % 2]
              anotherScroll.stop()
              anotherScroll.resetPosition()
            })
          })

          innerScroll.on('scroll', pos => {
            // if scroll event triggered not by touch event, such as by 'scrollTo' method
            if (!innerScroll.initiated || innerScroll.isInTransition) {
              return
            }

            if (this.nestMode === NEST_MODE_NATIVE && !this.touchStartMoment) {
              return
            }

            const reachBoundary = this._checkReachBoundary(pos)

            if (reachBoundary) {
              innerScroll.resetPosition()
              innerScroll.disable()
              // Prevent outer scroll have a bouncing step when enabled in 'free' nestMode.
              outerScroll.pointX = innerScroll.pointX
              outerScroll.pointY = innerScroll.pointY
              outerScroll.enable()
            } else {
              outerScroll.disable()
            }
            this.touchStartMoment = false

          })
        })
      },
      _checkReachBoundary(pos) {
        const distX = this.scroll.distX
        const distY = this.scroll.distY
        const reachBoundaryX = distX > 0 ? pos.x >= this.scroll.minScrollX : distX < 0 ? pos.x <= this.scroll.maxScrollX : false
        const reachBoundaryY = distY > 0 ? pos.y >= this.scroll.minScrollY : distY < 0 ? pos.y <= this.scroll.maxScrollY : false
        const freeScroll = this.scroll.freeScroll

        let reachBoundary
        if (freeScroll) {
          return reachBoundaryX || reachBoundaryY
        }

        if (this.scroll.movingDirectionX) {
          reachBoundary = reachBoundaryX
        } else if (this.scroll.movingDirectionY) {
          reachBoundary = reachBoundaryY
        }
        return reachBoundary
      },
      _calculateMinHeight() {
        if(this.$refs.listWrapper) {
          this.$refs.listWrapper.style.minHeight = this.pullDownRefresh || this.pullUpLoad ? `${getRect(this.$refs.wrapper).height + 1}px` : 0
        }
      },
      _getPullDownEleHeight() {
        const pulldown = this.$refs.pulldown.firstChild
        this.pullDownHeight = getRect(pulldown).height

        this.beforePullDown = false
        this.isPullingDown = true
        this.$nextTick(() => {
          this.pullDownStop = getRect(pulldown).height

          this.beforePullDown = true
          this.isPullingDown = false
        })
      },
      _onPullDownRefresh() {
        this.scroll.on('pullingDown', this._pullDownHandle)
        this.scroll.on('scroll', this._pullDownScrollHandle)
      },
      _pullDownHandle() {
        if (this.resetPullDownTimer) {
          clearTimeout(this.resetPullDownTimer)
        }
        this.beforePullDown = false
        this.isPullingDown = true
        this.$emit(EVENT_PULLING_DOWN)
      },
      _pullDownScrollHandle(pos) {
        if (this.beforePullDown) {
          this.bubbleY = Math.max(0, pos.y - this.pullDownHeight)
          this.pullDownStyle = `top:${Math.min(pos.y - this.pullDownHeight, 0)}px`
        } else {
          this.bubbleY = 0
          this.pullDownStyle = `top:${Math.min(pos.y - this.pullDownStop, 0)}px`
        }
      },
    },
    components: {
      AnimationLoading
    }
  }
</script>
