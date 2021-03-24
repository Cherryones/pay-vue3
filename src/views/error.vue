<!--
 * @Author: xiongying
 * @Date: 2019-12-10 14:25:19
 * @Description: 错误页面
 -->

<template>
  <div class="error-content">
    <!-- 不支持当前app -->
    <div class="comm-area"
         v-if="errorType === 'notSupport'">
      <p>暂不支持该app扫码</p>
    </div>
    <!-- Q8: 二维码失效，请重新扫码
    Q5: 终端未绑定商户
    Q3：商户已停用，请联系服务商检查商户状态
    Q4：终端已停用，请联系服务商检查终端状态
    Q6：终端已注销，请重新申请
    Q7：未知的商户服务错误 -->
    <div class="comm-area"
         v-else-if="['Q3', 'Q4', 'Q5', 'Q6', 'Q8', 'codeInvalid', 'codeInactive'].includes(errorType)">
      <img src="../assets/images/failed.png"
           alt=""
           width="100" v-if="errorType === 'Q8' || errorType === 'codeInvalid'">
      <img src="../assets/images/sqr_failed.png"
           alt="" v-else>
      <p>{{ errorMsg }}</p>

      <div class="code-url" v-if="errorType === 'Q5' || errorType === 'codeInactive'">
        <p>请复制链接做绑机处理</p><br>
        <p class="copy-link">{{codeUrl}}</p>
        <button class="copy-btn" v-clipboard:copy="codeUrl" v-clipboard:success="onCopy" v-if="codeUrl">复制</button>
      </div>

      <div class="code-url" v-if="['Q3', 'Q4'].includes(errorType)">
        <p class="copy-link">
          <span v-if="sn">SN：</span>
          <span>{{ sn }}</span>
        </p>
        <button class="copy-btn" v-clipboard:copy="sn" v-clipboard:success="onCopy" v-if="sn">复制</button>
      </div>
    </div>
    <!-- 404、500 -->
    <div class="comm-area"
         v-else-if="['404', '500'].includes(errorType)">
      <img src="../assets/images/404.png"
           alt=""
           width="160">
      <p>页面跑丢啦~</p>
    </div>
    <!-- 其它异常错误 -->
    <div class="comm-area"
         v-else>
      <img src="../assets/images/bad_request.png"
           alt=""
           width="100">
      <p>{{ errorMsg }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      errorType: '',
      errorMsg: '',
      codeUrl: ''
    }
  },
  mounted () {
    this.errorType = this.$route.query.type // 获取错误类型
    this.errorMsg = this.$route.query.msg
    this.codeUrl = this.getSession('codeUrl')
  },
  computed: {
    sn () {
      try {
        const reg = new RegExp('(^|&)sn=([^&]*)(&|$)', 'i')
        const r = this.codeUrl.split('?')[1].match(reg)
        return unescape(r[2])
      } catch (e) {
        return ''
      }
    }
  },
  methods: {
    onCopy () {
      this.$util.txtToast('复制成功')
    }
  }
}
</script>

<style lang="stylus" scoped>
.error-content
  overflow hidden
  height 100vh
  font-size 16px
  background #ffffff
  .comm-area
    margin 80px auto
    text-align center
    img
      display inline-block
      margin-bottom 20px
    .code-url
      margin 60px 0
      padding 0 20px
      font-size 15px
      line-height 24px
      word-break break-all
      .copy-btn
        margin-top 20px
        padding 10px 30px
        font-size 16px
        background #fff
        border none
        border solid 1px #808080
        border-radius 5px
</style>
