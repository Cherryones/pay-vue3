<!--
 * @Author: xiongying@xgd.com
 * @Date: 2020-06-19 16:42:11
 * @Description: 固定金额组件
-->
<template>
  <div class="static-container">
    <div class="amt-static">
      <div class="amt-box">
        <span class="amt-unit">{{ formatAmount }}元/份</span>
        <div class="input-number">
          <div class="input-number-btn"
               @click="handleSubtract">-</div>
          <div class="input-inner">
            <input type="number"
                   v-model="num"
                   @input="inputNum"
                   @blur="verifyNum"/>
          </div>
          <div class="input-number-btn"
               @click="handlePlus">+</div>
        </div>
      </div>
      <div class="clear"></div>
      <jl-remark v-if="!modelDetail"
                 :remark="remark"
                 @setRemark="setRemark"></jl-remark>
      <jl-form ref="form"
               v-if="modelDetail"
               :modelDetail="modelDetail"
               :jlModel="model"
               @setRemark="setRemark"></jl-form>
    </div>
    <footer>
      <div class="total-amt"><span>金额(元)：</span>{{ totalAmount }}</div>
      <div class="confirm-btn"
           @click="handleConfirm">确认支付</div>
    </footer>
  </div>
</template>
<script>
import jlForm from '../../../components/jlForm'
import jlRemark from '../../../components/jlRemark'
export default {
  components: { jlForm, jlRemark },
  data () {
    return {
      totalAmount: '',
      num: 1 // 份数
    }
  },
  props: ['formatAmount', 'modelDetail', 'remark', 'model'],
  watch: {
    formatAmount: {
      handler (val) {
        this.totalAmount = val
      },
      immediate: true
    }
  },
  methods: {
    // 计算总金额
    countMoney () {
      this.totalAmount = this.getFormatYuanAmt(
        this.num * this.getFormatFenAmt(this.formatAmount)
      )
    },
    // 减份数
    handleSubtract () {
      this.num = this.num > 1 ? this.num - 1 : 1
      this.num > 0 && this.countMoney()
    },
    // 加份数
    handlePlus () {
      this.num = this.num < 1000 ? this.num + 1 : 1000
      !(this.num > 1000) && this.countMoney()
    },
    // 输入时校验份数
    inputNum (e) {
      this.val = e.target.value.replace(/[^\d]/g, '')
      this.num = +this.val
    },
    // 输完校验份数
    verifyNum () {
      this.num = +this.num
      if (this.num === 0 || this.num > 1000) {
        let msg = '份数至少为1'
        if (this.num > 1000) {
          msg = '份数最大为1000'
        }
        this.$util.txtToast(msg)
        this.num = this.num === 0 ? 1 : this.num
        this.num = this.num > 1000 ? 1000 : this.num
      }
      this.countMoney()
    },
    // 确认支付
    handleConfirm () {
      const el = this.$refs.form
      if (el) {
        this.$refs.form.triggerSubmit()
      } else {
        this.$emit('setPayAmount', this.totalAmount)
      }
    },
    // 设置备注
    setRemark (val) {
      this.$emit('setRemark', val)
      this.$refs.form && this.$emit('setPayAmount', this.totalAmount)
    }
  }
}
</script>
<style lang="stylus" scoped>
.static-container
  height 100%
  .amt-box
    padding 0 1px 15px 1px
    line-height 38px
    border-bottom 1px solid #efeff4
    .amt-unit
      font-size 18px
      font-weight 500
    .input-number
      display inline-block
      float right
      border 1px solid #dcdfe6
      border-radius 4px
      & div
        float left
        height 36px
        display flex
        align-items center
        justify-content center
        text-align center
      .input-inner
        width 80px
        border-left 1px solid #dcdfe6
        border-right 1px solid #dcdfe6
        & input
          width 100%
          text-align center
          font-size 14px
          outline none
      .input-number-btn
        width 40px
        font-size 16px
        background #f5f7fa
        color #606266
      .input-number-btn:first-child
        border-radius 4px 0 0 4px
      .input-number-btn:last-child
        border-radius 0 4px 4px 0
</style>
