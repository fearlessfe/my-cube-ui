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
            <span>加载中</span>
            <!-- <loading></loading> -->
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
              <span>加载中</span>
              <!-- <loading></loading> -->
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
  import { getRect } from '../../common/helpers/dom'
  import { camelize } from '../../common/lang/string'
  export default {

  }
</script>
