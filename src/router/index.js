import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [{
    path: '/',
    name: 'Blank',
    alias: ['/sqr', '/fixedamount'],
    component: () => import(/* webpackChunkName: "blank" */ '@/views/blank')
  }, {
    path: '/payment',
    name: 'Payment',
    component: () => import(/* webpackChunkName: "payment" */ '@/views/payment/index')
  }, {
    path: '/fault',
    name: 'Fault',
    component: () => import(/* webpackChunkName: "error" */ '@/views/error')
  }]
})
