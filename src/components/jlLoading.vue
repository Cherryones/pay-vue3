<!--
 * @Author: xiongying@xgd.com
 * @Date: 2020-03-02 11:24:44
 * @Description: loading组件
-->

<template>
  <div class="load-mask">
    <cube-loading :size="size"></cube-loading>
  </div>
</template>
<script>
export default {
  props: {
    size: {
      type: Number,
      default: 30
    }
  }
}
</script>

<style lang="stylus" scoped>
.load-mask
  position fixed
  z-index 999
  width 100%
  min-height 100vh
  top 0
  left 0
  background rgba(0, 0, 0, 0.1)
  .cube-loading
    position absolute
    top 50%
    left 50%
    transform translate(-50%, -50%)
</style>
