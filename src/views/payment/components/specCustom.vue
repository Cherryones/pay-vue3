<!--
 * @Author: xiongying@xgd.com
 * @Date: 2020-06-19 16:42:11
 * @Description: 备注定制支付组件
-->

<template>
  <div class="custom-container">
    <div class="custom-body">
      <div class="amt-custom">
        <p class="amt-unit">金额（元）</p>
        <div class="amt-input">
          <span class="amt-symbol">￥</span>
          <input type="number"
                ref="amount"
                @input="inputAmount">
        </div>
        <jl-form ref="form"
              :modelDetail="modelDetail"
              :jlModel="model"
              @setRemark="setRemark"></jl-form>
      </div>
    </div>
    <footer>
      <div class="total-amt"><span>金额(元)：</span>{{ amount }}</div>
      <div class="confirm-btn"
           @click="handleConfirm">确认支付</div>
    </footer>
  </div>
</template>
<script>
import jlForm from '../../../components/jlForm'
export default {
  components: { jlForm },
  data () {
    return {
      amount: ''
    }
  },
  props: ['modelDetail', 'model'],
  methods: {
    // 清空金额
    clearAmount () {
      this.$refs.amount.value = ''
    },
    // 金额输入强制校验
    inputAmount (e) {
      let val = ''
      val = e.target.value.replace(/[^\d.]/g, '') // 不允许输入数字和小数点以外的数
      val = e.target.value.replace(/^\./g, '') // 第一位不允许输入小数点
      val = e.target.value.replace(/\.{2,}/g, '.') // 不允许连续输入小数点
      val = e.target.value.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.') // 不允许输入一次以上的小数点
      val = e.target.value.replace(/^(-)*(\d+)\.(\d\d).*$/, '$1$2.$3') // 小数位不允许超过两位
      if (e.target.value.indexOf('.') === -1 && e.target.value.length > 5) {
        val = e.target.value.substring(0, e.target.value.length - 1) // 金额不大于10万
      }
      this.$refs.amount.value = val
      this.amount = this.getFormatYuanAmt(this.getFormatFenAmt(this.$refs.amount.value))
    },
    // 确认支付
    handleConfirm () {
      if (this.amount === '') {
        this.$util.txtToast('请输入付款金额')
        return
      }
      if (this.amount === '0.00') {
        this.$util.txtToast('付款金额不能为0')
        return
      }
      this.$refs.form.triggerSubmit()
    },
    // 提交到父组件
    setRemark (val) {
      this.$emit('setRemark', val)
      this.$emit('setPayAmount', this.$refs.amount.value)
    }
  }
}
</script>
<style lang="stylus" scoped>
.custom-container
  height 100%
  .custom-body
    height 100%
    .amt-custom input
      width 80%
      outline none
      font-size 30px
</style>
