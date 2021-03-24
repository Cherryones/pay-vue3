import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './cube-ui'
import Common from './assets/js/common'
import Api from './assets/js/api'
import Axios from './assets/js/axios'
import Util from './assets/js/util'
import './assets/style/reset.css'
import cookies from 'vue-cookies'
// import 'amfe-flexible'
import './assets/js/rem'
import VueClipboard from 'vue-clipboard2'
import './assets/js/logger'
VueClipboard.config.autoSetContainer = true

Vue.config.productionTip = false

Vue.use(Common)
Vue.use(VueClipboard)
Vue.prototype.API = Api
Vue.prototype.$http = Axios
Vue.prototype.$util = Util
Vue.prototype.$cookies = cookies
new Vue({
  render: h => h(App),
  router
}).$mount('#app')

// 解决IOS12+，微信6.7.4+软键盘撑起页面不回弹的BUG
document.body.addEventListener('focusout', function () {
  window.scroll(0, 0)
})

// // 解决滚动条穿透
// document.body.addEventListener('touchmove', function (e) {
//   const el = document.querySelector('.install-list, .amt-custom, .amt-static, .amt-dynamic')
//   if (el && !el.contains(e.target)) {
//     e.preventDefault()
//   }
// }, { passive: false })

