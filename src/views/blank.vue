<!--
 * @Author: xiongying
 * @Date: 2019-12-05 14:53:20
 * @Description: 空白跳转页
 -->
<template>
  <div>
    <jl-loading v-if="loading"></jl-loading>
  </div>
</template>

<script>
import jlLoading from '../components/jlLoading'
export default {
  components: { jlLoading },
  data () {
    return {
      loading: true,
      businessType: '', // 业务类型 (static:静态码  sqr:立牌  fixedAmount:固定金额或者动态码)
      sn: '', // 机身号 业务类型为sqr时必有
      ac: '', // 校验码 业务类型为sqr时必有
      qrcode: '', // 业务类型为static时必有
      data: '' // 业务类型为fixedAmount时必有
    }
  },
  mounted () {
    this.getURLParams()
    this.fetchAuthUrl()
  },
  methods: {
    // 拿到URL里的参数
    getURLParams () {
      this.setSession('codeUrl', window.location.href)
      // 获取业务类型
      let frontUrl = window.location.href.split('?')[0]
      let type = frontUrl.substring(frontUrl.lastIndexOf('/') + 1)
      // 静态码
      if (!type) {
        this.businessType = 'static'
        this.qrcode = this.getQueryString('qrcode')
      } else {
        // 立牌
        if (type === 'sqr') {
          this.businessType = 'sqr'
          this.sn = this.getQueryString('sn')
          this.ac = this.getQueryString('ac')
        }
        // 动态码、购机款
        if (type === 'fixedamount') {
          this.businessType = 'fixedAmount'
          this.data = this.getQueryString('data')
        }
      }
      // 机房标识
      let source = this.getQueryString('r')
      if (source) {
        this.setSession('source', source)
      }
    },
    // 获取授权URL
    fetchAuthUrl () {
      let payType = ''
      let userAgent = (window.navigator.userAgent).toLowerCase() || ''
      if (userAgent.indexOf('unionpay') > -1) payType = 'unionpay'
      if (userAgent.indexOf('micromessenger') > -1) payType = 'wxpay'
      if (userAgent.indexOf('aliapp') > -1) payType = 'alipay'
      if (!payType) {
        this.$router.replace({
          path: 'fault',
          query: { type: 'notSupport' }
        })
      } else {
        // 存储支付方式
        this.setSession('payType', payType)
        let params = {
          business_type: this.businessType,
          qrcode: this.qrcode,
          sn: this.sn,
          ac: this.ac,
          data: this.data,
          pay_type: payType
        }
        // 生码错误前端提示
        if (this.businessType === 'fixedAmount' && this.isEmpty(this.data)) {
          this.loading = false
          this.$util.alert('二维码信息有误，请确认后再扫码')
          return
        }
        // 判断是否有cookie
        if (!this.isEmpty(this.$cookies.get('newOpenId'))) {
          this.fetchMerchInfo(params) // 单独获取商户信息，跳过授权
        } else {
          this.$http.post(this.API.FETCH_AUTH_URL, params).then((res) => {
            if (res.ret_code === '00' && res.auth_url) {
              res.log_id && this.setSession('logId', res.log_id)
              // 跳转到付款页
              window.location.replace(res.auth_url)
            } else {
              this.$router.replace({
                path: 'fault',
                query: { type: 'badRequest', msg: res.ret_msg }
              })
            }
          }).catch(err => {
            console.log(err)
            this.loading = false
          })
        }
      }
    },
    // 获取商户信息
    fetchMerchInfo (params) {
      this.$http.post(this.API.FETCH_MERCH_INFO, params, { retry: 1, timeout: 3000 }).then((res) => {
        this.loading = false
        if (res.ret_code === '00') {
          res.r && this.setSession('source', res.r)
          res.log_id && this.setSession('logId', res.log_id)
          this.setSession('totalInfo', res)
          this.$router.replace({ path: 'payment' })
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
          this.$router.replace({
            path: 'fault',
            query: { type: errCode, msg: errMsg}
            // query: { type: res.ret_code, msg: res.ret_msg }
          })
        }
      }).catch(err => {
        console.log(err)
        this.loading = false
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.container
  height fill-available
  background #ffffff
</style>
