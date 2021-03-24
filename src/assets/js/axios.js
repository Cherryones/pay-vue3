// 引用axios
import Vue from 'vue'
import {
  Dialog
} from 'cube-ui'
import Router from '../../router/index'
var axios = require('axios')
axios.defaults.timeout = 6000 // 请求响应超时

Vue.use(Dialog)
// POST传参序列化(添加请求拦截器)
axios.interceptors.request.use(
  config => {
    config.withCredentials = true
    config.headers['Content-Type'] = 'application/json;charset=UTF-8'
    config.headers['X-Requested-With'] = 'XMLHttpRequest'
    let logId = sessionStorage.getItem('logId') // 日志跟踪号
    if (logId) {
      config.headers['logId'] = JSON.parse(unescape(logId))
    }
    return config
  },
  error => Promise.reject(error)
)

// 返回状态判断(添加响应拦截器)
axios.interceptors.response.use(response => response.data, error => {
  let config = error.config
  if (config.retry > 0) { // 请求重发
    config.retry--
    return axios(config)
  }
  return Promise.reject(error)
})
// 自定义判断元素类型JS
function toType (obj) {
  return {}.toString
    .call(obj)
    .match(/\s([a-zA-Z]+)/)[1]
    .toLowerCase()
}
// 参数过滤函数
function filterNull (o) {
  for (var key in o) {
    if (o[key] === null) {
      delete o[key]
    }
    if (toType(o[key]) === 'string') {
      o[key] = o[key].trim()
    } else if (toType(o[key]) === 'object') {
      o[key] = filterNull(o[key])
    } else if (toType(o[key]) === 'array') {
      o[key] = filterNull(o[key])
    }
  }
  return o
}
/**
 * axios封装
 * @param {object} params
 * @param {object} config
 */
function apiAxios (params, config = {}) {
  if (params) {
    params = filterNull(params)
  }
  configBaseUrl(config.baseURL)
  return axios(params).then(res => {
    return Promise.resolve(res)
  }, err => {
    // 返回状态码处理
    let res = err.response || {}
    if (res.status === 404) {
      // 跳转至404页面
      Router.push({
        path: '/fault',
        query: {
          type: '404'
        }
      })
    } else if (res.status === 500) {
      // 跳转至500页面
      Router.push({
        path: '/fault',
        query: {
          type: '500'
        }
      })
    } else {
      let content = '请求超时，请稍后再试'
      if (err.message && err.message.toLowerCase() === 'network error') {
        content = '网络请求失败，请检查你的网络'
      }
      Dialog.$create({
        type: 'alert',
        title: '提示信息',
        content
      }).show()
    }
    return Promise.reject(res)
  })
}

export default {
  get: function (url, params = {}, config = {}) {
    const param = {
      method: 'get',
      url,
      params
    }
    return apiAxios(param, config)
  },
  post: function (url, data = {}, config = {}) {
    const param = {
      method: 'post',
      url,
      data,
      timeout: config.timeout,
      retry: config.retry
    }
    return apiAxios(param, config)
  },
  axios
}
/**
 * 配置请求根路径
 * @param {string} type 区分一般请求或广告请求
 */
function configBaseUrl (type = 'api') {
  if (process.env.NODE_ENV !== 'development') {
    if (type === 'api') {
      axios.defaults.baseURL = process.env.VUE_APP_API_ROOT
      // 生产环境配置机房
      if (process.env.NODE_ENV === 'production') {
        axios.defaults.baseURL = differMachineRoom(process.env.VUE_APP_API_ROOT)
      }
    } else if (type === 'board') {
      axios.defaults.baseURL = process.env.VUE_APP_API_ROOT_BOARD
    }
  } else {
    if (type === 'api') {
      axios.defaults.baseURL = '/api'
    } else if (type === 'board') {
      axios.defaults.baseURL = '/board'
    }
  }
}
/**
 * 区分机房
 * @param {string} prodUrl process.env.API_ROOT
 */
function differMachineRoom (prodUrl) {
  let sourceFlag = JSON.parse((unescape(sessionStorage.getItem('source'))))
  if (sourceFlag) {
    let linkBack = prodUrl.split('://')[1]
    let mainStr = linkBack.match(/^[^.]*(?=.)/)[0].toString()
    if (mainStr) {
      let replaceStr = mainStr + '-' + sourceFlag
      prodUrl = prodUrl.replace(mainStr, replaceStr)
      return prodUrl
    }
  }
  return prodUrl
}
