<!--
 * @Author: xiongying@xgd.com
 * @Date: 2020-06-20 14:52:02
 * @Description 备注组件
-->
<template>
  <div class="amt-remark">
    <div class="remark-content">
      <span v-if="remark !== ''">备注：</span><span>{{ remark }}</span>
    </div>
    <div class="remark-btn" @click="openRemark">
      <span v-if="remark === ''">＋ 添加备注</span>
      <span v-if="remark !== ''">修改备注</span>
    </div>
  </div>
</template>
<script>
export default {
  props: ['remark'],
  methods: {
    openRemark () {
      const t = this
      t.$util.prompt(t.remark, {
        title: '请输入付款备注',
        len: 20,
        placeholder: '最多输入20个字符',
        okCallBack: function (promptValue) {
          t.$emit('setRemark', promptValue)
        }
      })
    }
  }
}
</script>
<style lang="stylus" scoped>
.amt-remark
  display flex
  flex-flow row
  align-items center
  padding-top 15px
  font-size 14px
  .remark-btn
    color #25abee
  .remark-content
    flex 1
    line-height 18px
    color #999
</style>
<style lang="stylus">
.cube-dialog-prompt
  .remark
    margin-top 5px
    input
      font-size 14px
      border 1px solid #efeff4
      outline none
      // -webkit-appearance none
  .cube-dialog-btn_highlight
    color #25abee
  .cube-dialog-title-def
    overflow visible
  .cube-dialog-btn
    padding 16px 10px
  .border-top-1px, .border-right-1px, .border-bottom-1px, .border-left-1px
    position: relative
    &::before, &::after
      content: ""
      display: none
</style>
