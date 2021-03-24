<!--
 * @Author: xiongying
 * @Date: 2019-12-06 17:16:31
 * @Description: 数字键盘
 -->

<template>
  <div class="key-container">
    <div class="key-title">
      <span class="red">*</span>为保证您的资金安全，请确认商户信息后进行付款
    </div>
    <div class="keyboard">
      <div class="key-row"
           v-for="(item, x) in keyList"
           :key="x">
        <div :class="['key-cell', {'text-key': num === 'C'}]"
             v-for="(num, y) in item"
             :key="y"
             @touchstart.prevent="handleKeyPress(num)">{{num === 'C' ? '重输' : num}}</div>
      </div>
      <div class="key-row">
        <div class="key-cell delete-cell"
             @touchstart.prevent="handleKeyPress('D')"></div>
        <div class="key-confirm"
             @touchstart.prevent="handleKeyPress('S')">确<br>认<br>支<br>付<br></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      result: '',
      keyList: [['1', '4', '7', 'C'], ['2', '5', '8', '0'], ['3', '6', '9', '.']]
    }
  },
  props: ['userInput'],
  watch: {
    userInput (val) {
      this.result = val
    },
    result (val) {
      this.$emit('showUserInput', val)
    }
  },
  methods: {
    // 处理按键
    handleKeyPress (val) {
      let num = val
      switch (num.toString()) {
        // 清空键
        case 'C':
          this.handleClearKey()
          break
        // 删除键
        case 'D':
          this.handleDeleteKey()
          break
        // 小数点
        case '.':
          this.handleDecimalPoint()
          break
        // 确认键
        case 'S':
          this.handleConfirmKey()
          break
        // 数字键
        default:
          this.handleNumberKey(num)
          break
      }
    },
    // 清空
    handleClearKey () {
      this.result = ''
    },
    // 删除
    handleDeleteKey () {
      let S = this.result
      if (!S.length) return false
      this.result = S.substring(0, S.length - 1)
    },
    // 小数点
    handleDecimalPoint () {
      if (this.result.indexOf('.') > -1) return false
      if (!this.result.length) {
        // 如果小数点是第一位，补0
        this.result = '0.'
      } else {
        this.result = this.result + '.'
      }
    },
    // 数字
    handleNumberKey (num) {
      let S = this.result
      // 当前有小数点且小数位小于2
      if (S.indexOf('.') > -1 && S.substring(S.indexOf('.') + 1).length < 2) {
        this.result = S + num
      }
      // 没有小数点
      if (!(S.indexOf('.') > -1)) {
        // 如果第一位是0，带上小数点
        if (num === 0 && S.length === 0) {
          this.result = '0.'
        } else {
          if (S.length && Number(S.charAt(0)) === 0) return
          if (S.length > 4) {
            return false
          }
          this.result = S + num
        }
      }
    },
    // 支付
    handleConfirmKey () {
      let S = this.result
      if (!S.length) {
        this.$util.txtToast('请输入付款金额')
        return false
      }
      // 小数点是最后一位补00
      if (S.indexOf('.') > -1 && S.indexOf('.') === S.length - 1) {
        S = S + '00'
      }
      // 保留两位
      this.result = S
      this.$emit('handleConfirm', this.result)
    }
  }
}
</script>

<style lang="stylus" scoped>
.unable-color
  background #67c4f3 !important
.key-container
  position fixed
  left 0
  bottom 0
  width 100%
  background #ffffff
  .key-title
    padding 10px 0
    font-size 12px
    text-align center
    color #999
    .red
      color red
  .key-row
    float left
    border-top 1px solid #efeff4
    width 25%
    .text-key
      font-size 20px !important
    .key-cell
      display flex
      align-items center
      justify-content center
      height 60px
      border-right 1px solid #efeff4
      border-bottom 1px solid #efeff4
      text-align center
      font-size 26px
      font-weight 500
    .delete-cell
      background url('../assets/images/back_key.png') no-repeat center
      background-size 40px
    .key-confirm
      width 100%
      height 180px
      line-height 30px
      font-size 22px
      color #ffffff
      background #25abee
      display flex
      align-items center
      justify-content center
</style>
