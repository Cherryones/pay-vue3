<!--
 * @Author: xiongying@xgd.com
 * @Date: 2020-06-19 16:42:11
 * @Description: 用户自输入的支付组件
-->

<template>
  <div class="amt-dynamic">
    <p class="amt-unit">金额（元）</p>
    <div class="amt-input">
      <span class="amt-symbol">￥</span>
      <div class="imitate-input">{{ userInput }}</div>
      <i class="cubeic-wrong delete-icon"
         v-if="userInput !== ''"
         @click="clearUserInput"></i>
    </div>
    <slot name="remark"></slot>
    <!-- 数字键盘 -->
    <numberKeyboard :userInput="userInput"
                    @showUserInput="showUserInput"
                    @handleConfirm="handleConfirm"></numberKeyboard>
  </div>
</template>
<script>
import numberKeyboard from '../../../components/numberKeyboard'
export default {
  components: { numberKeyboard },
  data () {
    return {
      userInput: '' // 用户输入金额
    }
  },
  methods: {
    // 清空金额
    clearUserInput () {
      this.userInput = ''
    },
    // 展示键盘输入金额
    showUserInput (result) {
      this.userInput = result
    },
    // 确认支付
    handleConfirm (amount) {
      const formatAmt = this.getFormatFenAmt(amount)
      if (formatAmt === '0' || formatAmt === '000') {
        this.$util.txtToast('付款金额不能为0')
        return false
      }
      this.$emit('setPayAmount', amount)
    }
  }
}
</script>
<style lang="stylus" scoped>
.imitate-input
  display inline-block
  min-width 100px
  font-size 30px
  font-weight bold
  outline none
</style>
