<!--
 * @Author: xiongying@xgd.com
 * @Date: 2020-03-06 10:31:01
 * @Description: 分期蒙层组件
 -->
<template>
  <div>
    <transition name="slide-fade">
      <div class="install-panel" v-if="show">
        <div class="panel-title">
          <div class="title-icon"
              @click="handleClose"><i class="cubeic-close"></i></div>
          <div class="title-tip">选择支付方式</div>
          <div class="title-icon"></div>
        </div>
        <div class="panel-body">
          <div class="theme alipay-way">
            <cube-radio-group>
                <cube-radio option="1"
                            v-model="isInstallment"
                            v-show="1 === 2">
                </cube-radio>
                <cube-radio option="0"
                            :hollow-style="true"
                            v-model="isInstallment"
                            position="right">
                  支付宝支付
                </cube-radio>
              </cube-radio-group>
          </div>
          <div class="theme huabei-way">花呗分期<span class="tag comm-tag">分期付·更轻松</span></div>
          <ul class="install-list">
            <li class="item">
              <cube-radio-group>
                <cube-radio v-for="(option, index) in list"
                            :key="index"
                            :option="option"
                            v-model="periods"
                            position="right"
                            :hollow-style="true">
                  <div>
                    <p>
                      <span>¥{{getFormatYuanAmt(option.prin_and_fee)}} × {{option.hp_number}}期</span>
                      <span class="more-cheap comm-tag" v-if="Number(option.each_fee) === moreCheap">更划算</span>
                    </p>
                    <p class="fee-amt">手续费 ¥ {{getFormatYuanAmt(option.each_fee)}}/期</p>
                  </div>
                </cube-radio>
              </cube-radio-group>
            </li>
          </ul>
          <cube-button type="submit"
                      :light="false"
                      class="confirm-btn" @click="doPay">确认付款</cube-button>
        </div>
      </div>
    </transition>
    <div class="mask" v-if="show"></div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      isInstallment: '0', // 默认不分期
      periods: '',
      list: [],
      rate: [],
      moreCheap: ''
    }
  },
  props: {
    isStage: {
      type: Boolean,
      default: false
    },
    totalAmt: {
      type: String,
      default: '0'
    }
  },
  computed: {
    show: {
      get () {
        return this.isStage
      },
      set () {}
    }
  },
  watch: {
    periods (val) {
      val !== '' && (this.isInstallment = '1')
    },
    isInstallment (val) {
      val === '0' && (this.periods = '')
    }
  },
  methods: {
    // 获取分期数据
    fetchInstallInfo () {
      this.rate = []
      this.$http.post(this.API.FETCH_HIRE_PURCHASE_INFO, { amount: this.totalAmt }).then(res => {
        if (res.ret_code === '00') {
          for (let i = 0; i < res.list.length; i++) {
            res.list[i].value = JSON.stringify({...res.list[i]})
            this.rate.push(Number(res.list[i].each_fee))
          }
          this.moreCheap = Math.min(...this.rate)
          res.list && (this.list = [...res.list])
        } else {
          let _this = this
          this.$util.alert(res.ret_msg, {
            okCallBack: function () {
              _this.handleClose()
            }
          })
        }
      }).catch(e=>{
        console.log(e)
      })
    },
    // 确认支付
    doPay () {
      let params = {}
      if (this.periods !== '') {
        params = {...JSON.parse(this.periods)}
        params.hp_flag = '1'
      }
      this.$emit('fetchPayInfo', params)
      this.handleClose()
    },
    // 关闭
    handleClose () {
      this.visible = false
      this.$emit('update:isStage', false)
    }
  },
  mounted () {
    this.show && this.fetchInstallInfo()
  }
}
</script>

<style lang="stylus" scoped>
.mask
  position absolute
  top 0
  z-index 99
  width 100%
  height 100vh
  background rgba(0, 0, 0, 0.3)
.install-panel
  display flex
  flex-flow column
  position fixed
  bottom 0
  z-index 100
  width 100%
  height 70vh
  padding-bottom 20px
  background #fff
  .panel-title
    display flex
    line-height 56px
    border-bottom solid 1px #f0f0f0
    font-size 20px
    font-weight bold
    .title-tip
      flex 1
      text-align center
      font-weight bold
      font-size 18px
    .title-icon
      width 60px
      text-align center
      font-size 22px
      img
        height 18px
  .panel-body
    flex 1
    display flex
    flex-direction column
    .alipay-way
      padding 8px 0 8px 56px
      background url('../../assets/images/alipay.png') no-repeat 10px 16px
    .huabei-way
      padding 0 56px
      line-height 62px
      background url('../../assets/images/installment.png') no-repeat 10px 18px
    .theme
      margin 0 15px
      font-size 16px
      border-bottom solid 1px #f0f0f0
      background-size 30px
      .tag
        width 80px
        color #ff6459
        background url('../../assets/images/tag_border.png') no-repeat center 23px
        background-size 70px
    ul
      overflow-y auto
      padding-left 50px
      font-size 15px
      flex 1
      .item
        margin 0 15px 0 6px
        .fee-amt
          font-size 14px
          color #909090
        .more-cheap
          width 40px
          color #fff
          background url('../../assets/images/tag_bg.png') no-repeat center
          background-size 40px 15px
    .confirm-btn
      width 94%
      margin 20px auto 0
      border-radius 5px
      font-size 18px
.comm-tag
  display inline-block
  text-align center
  font-size 10px

.install-panel ::v-deep
  .cube-btn
    padding 0
    height 50px
    background #25abee
  .border-top-1px, .border-right-1px, .border-bottom-1px, .border-left-1px
    position: relative
    &::before, &::after
      content: ""
      display: none
.alipay-way
  .cube-radio
    padding-left 0
    color #333

// 进入离开过渡
.slide-fade-enter-active {
  animation fadeIn .3s linear forwards
}
.slide-fade-leave-active {
  animation fadeOut .3s linear forwards
}
@keyframes fadeIn
  0%
    transform translateY(100%)
  100%
    transform translateY(0)
@keyframes fadeOut
  0%
    transform translateY(0)
  100%
    transform translateY(100%)
</style>
