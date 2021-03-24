<!--
 * @Author: xiongying
 * @Date: 2019-12-05 15:24:41
 * @Description: 付款页面
 -->

<template>
  <div>
      <div class="container" v-if="showPayment">
        <header>
          <img :src="logoUrl"
              alt="logo" />
          <p class="merch-name">{{ simpleName }}</p>
        </header>
        <main>
          <!-- 非固定金额 -->
          <user-input v-if="fixFlag === '0' && !modelDetail"
                      @setPayAmount="setPayAmount">
            <template v-slot:remark>
              <jl-remark :remark="remark"
                      @setRemark="setRemark"></jl-remark>
            </template>
          </user-input>
          <!-- 针对非固定金额特殊定制页面 -->
          <spec-custom v-if="fixFlag === '0' && modelDetail"
                       :modelDetail="modelDetail"
                       :model="model"
                       @setPayAmount="setPayAmount"
                       @setRemark="setRemark"></spec-custom>
          <!-- 固定金额 -->
          <fixed-amount v-if="fixFlag === '1'"
                        :remark="remark"
                        :formatAmount="formatAmount"
                        :modelDetail="modelDetail"
                        :model="model"
                        @setRemark="setRemark"
                        @setPayAmount="setPayAmount">
          </fixed-amount>
        </main>
        <!-- 选择分期 -->
        <installment ref="install"
                     v-if="payType === 'alipay'"
                     :isStage.sync="isStage"
                     :totalAmt='amount'
                     @fetchPayInfo="fetchPayInfo"
                     ></installment>
      </div>
      <jl-loading v-if="loading"></jl-loading>
  </div>
</template>

<script>
import jlLoading from '../../components/jlLoading'
import jlRemark from '../../components/jlRemark'
import installment from './components/installment'
import userInput from './components/userInput'
import fixedAmount from './components/fixedAmount'
import specCustom from './components/specCustom'
export default {
  components: { jlLoading, jlRemark, installment, userInput, fixedAmount, specCustom },
  data () {
    return {
      loading: true,
      showPayment: false, // 是否展示支付页面
      payType: '', // 支付方式
      source: '', // 请求来源,用于区别购机款
      codeType: '', // 码类型 0:静态码 1:动态码
      simpleName: '', // 商户简称
      fixFlag: '', // 是否固定金额 0:否 1:是
      fixAmount: '', // 固定金额(单价)
      remarkFlag: '', // 是否需要备注 0:否 1:是
      remark: '', // 备注
      fqMinAmount: '', // 允许使用分期的最小金额，仅限支付宝使用
      formatAmount: '', // 非动态码和购机款的付款金额 (元)
      amount: '', // 最终支付金额
      merchNo: '',
      directAgentId: '',
      orderNo: '',
      deviceSn: '',
      termNo: '',
      notifyUrl: '', // 回调地址，请求来源为购机款时必有
      subject: '', // 订单标题，请求来源为购机款时必有
      codeId: '', // 二维码流水号（动态码时出现）
      openId: null, // 用户标识
      modelDetail: null, // 定制备注内容
      model: {}, // 备注表单初始化需要
      payFlag: true, // 允许点击支付
      timer: null,
      logoUrl: require('../../assets/images/default_logo.png'),
      isStage: false // 是否展示分期
    }
  },
  mounted () {
    this.init()
  },
  watch: {
    openId (val) {
      if (!this.isEmpty(val)) {
        this.timer && this.confirmPay()
      }
    }
  },
  methods: {
    // 页面初始化
    init () {
      const t = this
      t.payType = t.getSession('payType') // 支付方式
      t.openId = t.$cookies.get('newOpenId') // 用户标识
      // 初次进入支付页面
      if (!t.openId) {
        const source = t.getQueryString('r') // 机房标识
        source && t.setSession('source', source)
        t.fetchOpenIdKey()
      } else {
        const totalInfo = t.getSession('totalInfo')
        if (!totalInfo) {
          t.loading = false
          t.$util.alert('商户信息获取失败，请重新扫码', {
            okCallBack: function () {
              t.closeJLWindow()
            }
          })
          return
        }
        t.source = totalInfo.source
        t.codeType = totalInfo.code_type
        t.showPayment = t.codeType && !(t.source === 'gjk' || t.codeType === '1')
        t.simpleName = totalInfo.simple_name
        t.fixFlag = totalInfo.fix_flag
        t.fixAmount = totalInfo.fix_amount
        t.remarkFlag = totalInfo.remark_required_flag
        t.fqMinAmount = totalInfo.hp_min_amount
        t.merchNo = totalInfo.merch_no
        t.directAgentId = totalInfo.direct_agent_id
        t.orderNo = totalInfo.order_no
        t.subject = totalInfo.subject
        t.notifyUrl = totalInfo.notify_url
        t.deviceSn = totalInfo.device_sn
        t.termNo = totalInfo.term_no
        t.codeId = totalInfo.code_id
        t.handleModelData(totalInfo.model_detail)
        t.showPayment && (t.loading = false)
        if (t.showPayment) { // 静态码
          if (t.fixFlag === '1') { // 固定金额
            t.formatAmount = t.getFormatYuanAmt(t.fixAmount)
          }
          if (totalInfo.logo_url) {
            t.logoUrl = totalInfo.logo_url
          }
        } else {
          t.amount = totalInfo.amount
          t.confirmPay()
        }
      }
    },
    // 获取用户授权码
    fetchAuthCode () {
      const t = this
      switch (t.payType) {
        case 'alipay':
          return t.getQueryString('auth_code')
        case 'wxpay':
          return t.getQueryString('code')
        case 'unionpay':
          return t.getQueryString('userAuthCode')
        default:
          this.$router.replace({
            path: 'fault',
            query: { type: 'notSupport' }
          })
      }
      return null
    },
    // 获取用户标识(openID)对应的key
    fetchOpenIdKey () {
      const t = this
      const authCode = t.fetchAuthCode()
      let params = {
        pay_type: t.payType,
        cache_key: t.getQueryString('cacheKey'),
        auth_code: authCode,
        user_agent: window.navigator.userAgent
      }
      t.$http.post(t.API.FETCH_OPEN_ID, params, { retry: 1, timeout: 3000 }).then(res => {
        if (res.ret_code === '00') {
          this.setSession('totalInfo', res)
          t.source = res.source
          t.codeType = res.code_type
          // 静态码(codeType=0)且不是购机款(gjk)展示付款页面,否则直接唤起支付
          t.showPayment = t.codeType && !(t.source === 'gjk' || t.codeType === '1')
          t.simpleName = res.simple_name
          t.fixFlag = res.fix_flag
          t.fixAmount = res.fix_amount
          t.remarkFlag = res.remark_required_flag
          t.fqMinAmount = res.hp_min_amount
          t.merchNo = res.merch_no
          t.directAgentId = res.direct_agent_id
          t.orderNo = res.order_no // 只在购机款返回
          t.subject = res.subject
          t.notifyUrl = res.notify_url
          t.deviceSn = res.device_sn
          t.termNo = res.term_no
          t.codeId = res.code_id
          t.handleModelData(res.model_detail)
          if (t.fixFlag === '1') { // 固定金额
            t.formatAmount = t.getFormatYuanAmt(t.fixAmount)
          }
          if (t.showPayment) {
            t.loading = false
            if (res.logo_url) {
              t.logoUrl = res.logo_url
            }
          } else {
            t.amount = res.amount
          }
          t.fetchRealOpenId(res.open_id)
        } else {
          // 新功能上线兼容老服务代码，后台服务全部上线后可删除
          let errCode = res.ret_code
          let errMsg = res.ret_msg
          if (errMsg === '二维码失效[BIZ_ERROR]') {
            errCode = 'codeInvalid'
            errMsg = '二维码失效，请重新扫码'
          }
          if (errMsg === '商户不可用[BIZ_ERROR]') {
            errCode = 'codeInactive'
            errMsg = '未绑定商户'
          }
          t.$router.replace({
            path: 'fault',
            query: { type: errCode, msg: errMsg }
            // query: { type: res.ret_code, msg: res.ret_msg }
          })
        }
      }).catch(err => {
        console.log(err)
        t.loading = false
      })
    },
    // 获取真实的openId
    fetchRealOpenId (openIdKey) {
      const t = this
      t.$http.post(this.API.FETCH_REAL_OPEN_ID, { openid_key: openIdKey }).then(res => {
        if (res.ret_code === '00') {
          t.payType !== 'unionpay' && t.$cookies.set('newOpenId', res.open_id, 365 * 24 * 3600) // openId写入cookie(云闪付不走缓存机制)
          t.openId = res.open_id
          !t.showPayment && t.confirmPay()
        } else {
          !t.showPayment && (t.loading = false)
          let msg = res.ret_msg || ''
          msg = msg.replace(/\[BIZ_ERROR\]/g, '')
          t.$util.alert(msg, {
            okCallBack: function () {
              t.closeJLWindow()
            }
          })
        }
      }).catch(err => {
        console.log(err)
        !t.showPayment && (t.loading = false)
      })
    },
    // 确认支付
    confirmPay () {
      if (this.remarkFlag === '1' && this.remark === '' && !this.modelDetail) {
        this.$util.txtToast('请输入付款备注')
        return false
      }
      if (this.payType === 'alipay' && this.fqMinAmount && !(Number(this.amount) < Number(this.fqMinAmount))) {
        this.isStage = true
      } else {
        this.fetchPayInfo()
      }
    },
    // 获取支付凭证
    fetchPayInfo (fqParams = {}) {
      const t = this
      if (t.showPayment) {
        this.loading = true
      }
      const baseParams = {
        pay_type: t.payType,
        open_id: t.openId,
        code_type: t.codeType,
        code_id: t.codeId,
        source: t.source,
        amount: t.amount,
        merch_no: t.merchNo,
        term_no: t.termNo,
        device_sn: t.deviceSn,
        remark: t.remark,
        subject: t.subject || t.simpleName
      }
      const gjkParams = {
        order_no: t.orderNo,
        notify_url: t.notifyUrl
      }
      let params = Object.assign({}, baseParams, fqParams)
      if (t.source === 'gjk') {
        params = Object.assign({}, params, gjkParams)
      }
      if (t.payFlag) {
        if (!this.isEmpty(t.openId)) { // openId获取到才允许支付
          if (t.timer) { // 定时器开启后，在5s内监听到openId并且重新付款，关闭定时器
            clearTimeout(t.timer)
            t.timer = null
          }
          t.payFlag = false
          t.$http.post(t.API.FETCH_PAY_INFO, params).then(res => {
            if (res.ret_code === '00') {
              t.orderNo = res.order_no
              t.beforeCallpay(res.pay_info)
            } else {
              t.payFlag = true
              t.loading = false
              let msg = res.ret_msg || ''
              msg = msg.replace(/\[BIZ_ERROR\]/g, '')
              t.$util.alert(msg, {
                okCallBack: function () {
                  t.closeJLWindow()
                }
              })
            }
          }).catch(err => {
            console.log(err)
            t.loading = false
            t.payFlag = true
          })
        } else {
          // 支付时未获取到openId，开启定时器
          // 5s后仍未获取到openId，前端抛出错误，关闭页面（云闪付不可关闭）
          t.timer = setTimeout(function () {
            t.loading = false
            t.payFlag = true
            clearTimeout(t.timer)
            t.timer = null
            t.$util.alert('获取用户标识失败，请重新扫码', {
              okCallBack: function () {
                t.closeJLWindow()
              }
            })
          }, 5000)
        }
      }
    },
    // 调起支付框入口
    beforeCallpay (payInfo) {
      // 微信
      if (this.payType === 'wxpay') {
        let wxConfig = JSON.parse(payInfo)
        if (typeof WeixinJSBridge === 'undefined') {
          if (document.addEventListener) {
            document.addEventListener('WeixinJSBridgeReady', () => { this.callWxPayBox(wxConfig) }, false)
          } else if (document.attachEvent) {
            document.attachEvent('WeixinJSBridgeReady', () => { this.callWxPayBox(wxConfig) }, this.callWxPayBox(wxConfig))
            document.attachEvent('onWeixinJSBridgeReady', () => { this.callWxPayBox(wxConfig) }, this.callWxPayBox(wxConfig))
          }
        } else {
          this.loading = false
          this.callWxPayBox(wxConfig)
        }
      }
      // 支付宝
      if (this.payType === 'alipay') {
        let orderNo = payInfo
        // 如果jsbridge已经注入则直接调用
        if (window.AlipayJSBridge) {
          this.loading = false
          this.callAlipayBox && this.callAlipayBox(orderNo)
        } else {
          // 如果没有注入则监听注入的事件
          document.addEventListener('AlipayJSBridgeReady', () => { this.callAlipayBox(orderNo) }, false)
        }
      }
      // 银联云闪付(直接进入链接)
      if (this.payType === 'unionpay') {
        this.loading = false
        window.location.replace(payInfo)
      }
    },
    // 调起微信支付框
    callWxPayBox (wxConfig) {
      let _this = this
      try {
        /* eslint-disable no-undef */
        WeixinJSBridge.invoke('getBrandWCPayRequest', wxConfig, function (res) {
          if (res.err_msg === 'get_brand_wcpay_request:ok') {
            // 支付成功
            _this.openBoardPage()
          } else {
            // 通知后台
            if (_this.codeType === '0') {
              let params = {
                order_no: _this.orderNo,
                code_type: '0'
              }
              _this.$http.post(_this.API.INFORM_CLOSE, params).then(() => {
                WeixinJSBridge.call('closeWindow')
              }).catch(() => {
                WeixinJSBridge.call('closeWindow')
              })
            } else {
              _this.$util.alert('很抱歉，您本次付款未能成功，请重新付款', {
                okCallBack: function () {
                  WeixinJSBridge.call('closeWindow')
                }
              })
            }
          }
        })
      } catch (err) {
        _this.$util.alert('调起微信支付失败，请稍后再试', {
          okCallBack: function () {
            WeixinJSBridge && WeixinJSBridge.call('closeWindow')
          }
        })
      }
    },
    // 调起支付宝支付框
    callAlipayBox (tradeNO) {
      let _this = this
      try {
        /* eslint-disable no-undef */
        AlipayJSBridge.call('tradePay', { tradeNO: tradeNO }, function (result) {
          if (result.resultCode === '9000') {
            // 支付成功
            _this.openBoardPage()
          } else if (result.resultCode === '6001' || result.resultCode === '4000' || result.resultCode === '7001' || result.resultCode === '99') {
            if (_this.codeType === '0') {
              let params = {
                code_type: '0',
                order_no: _this.orderNo
              }
              _this.$http.post(_this.API.INFORM_CLOSE, params).then(() => {
                AlipayJSBridge.call('closeWebview')
              }).catch(() => {
                AlipayJSBridge.call('closeWebview')
              })
            } else {
              AlipayJSBridge.call('closeWebview')
            }
          }
        })
      } catch (e) {
        _this.$util.alert('调起支付宝支付失败，请稍后再试', {
          okCallBack: function () {
            AlipayJSBridge && AlipayJSBridge.call('closeWebview')
          }
        })
      }
    },
    // 支付完成跳转广告页
    openBoardPage () {
      const argName = `VUE_APP_PID_${this.payType.toUpperCase()}`
      let params = {
        pId: process.env[argName],
        merchant_id: this.merchNo,
        agent_id: this.directAgentId
      }
      if (this.payType === 'alipay') {
        params = {...params, order_id: this.orderNo}
      }
      this.$http.post(null, params, {baseURL: 'board'}).then(res => {
        if (res.ret_code === '00' && res.datas && res.datas.length > 0) {
          if (res.datas[0].context && res.datas[0].context.length > 0) {
            let boardUrl = res.datas[0].context[0].linkUrl
            if (boardUrl) {
              window.location.replace(boardUrl)
            } else {
              this.closeJLWindow()
            }
          }
        } else {
          this.closeJLWindow()
        }
      }).catch(err => {
        console.log(err)
        this.closeJLWindow()
      })
    },
    // 设置支付金额
    setPayAmount (val) {
      this.amount = this.getFormatFenAmt(val)
      this.confirmPay()
    },
    // 设置备注
    setRemark (val) {
      this.remark = val
    },
    // 根据不同app关闭窗口
    closeJLWindow () {
      if (this.payType === 'wxpay') {
        /* eslint-disable no-undef */
        WeixinJSBridge && WeixinJSBridge.call('closeWindow')
      } else if (this.payType === 'alipay') {
        AlipayJSBridge && AlipayJSBridge.call('closeWebview')
      }
    },
    // 由于存量数据和新数据数据格式不一致，故做此处理
    handleModelData (modelInfo) {
      if (modelInfo) {
        let modelObj = JSON.parse(modelInfo)
        if (Array.isArray(modelObj)) {
          this.modelDetail = [...modelObj]
        } else {
          this.modelDetail = modelObj.modelDetail
          this.model = modelObj.model
        }
      }
    },
    // 清除定时器
    beforeDestroy () {
      clearTimeout(this.timer)
      this.timer = null
    }
  }
}
</script>

<style lang="stylus" scoped>
.container
  display flex
  flex-direction column
  width 100%
  height 100vh
  header
    margin 10px 0
    padding 15px 0
    text-align center
    background #ffffff
    & img
      height 50px
    .merch-name
      display flex
      align-items center
      justify-content center
      margin-top 10px
      padding 0 10px
      line-height 24px
      font-size 20px
      font-weight bold
    .merch-info
      font-size 14px
      color #999
  main
    flex 1
    overflow hidden
</style>

<style lang="stylus">
.amt-custom, .amt-static, .amt-dynamic
  max-height calc(100% - 60px)
  overflow-y auto
  padding 15px 12px
  background #fff
.amt-unit
  font-size 16px
  font-weight 500
.amt-input
  margin-top 12px
  padding-bottom 5px
  border-bottom 1px solid #efeff4
  line-height 36px
  .amt-symbol
    margin-right 8px
    font-size 18px
    font-weight bold
  .delete-icon
    float right
    font-size 16px
    color #999
.container footer
  position fixed
  bottom 0
  z-index 10
  width 100%
  height 60px
  font-size 18px
  & div
    float left
    width 50%
    display flex
    align-items center
  .total-amt
    height 60px
    padding-left 10px
    background #ffffff
    & span
      font-size 15px
      color #999
  .confirm-btn
    justify-content center
    height 60px
    background #25abee
    color #ffffff
    letter-spacing 2px
</style>
