'user strict'
/**
 * 弹框函数封装
 * author:qinyifang@XGD.com
 */
import Vue from 'vue'
import {
  Dialog,
  Toast
} from 'cube-ui'
Vue.use(Dialog)
Vue.use(Toast)

/**
 * 弹出框
 * @param {type} 弹框类型
 * @param {msg} 可以是文字或者html
 * @param {options} {"title":"","okCallBack":"","okLabel":"","cancelCallBack":"","cancelLabel":""}
 */
function dialog (type, msg, options = {}) {
  options.title = options.title || '提示信息'
  options.okLabel = options.okLabel || '确定'
  options.cancelLabel = options.cancelLabel || '取消'
  Dialog.$create({
    type: type,
    title: options.title,
    content: msg,
    confirmBtn: {
      text: options.okLabel,
      active: true,
      disabled: false,
      href: 'javascript:;'
    },
    cancelBtn: {
      text: options.cancelLabel,
      active: false,
      disabled: false,
      href: 'javascript:;'
    },
    onConfirm: () => {
      if (options.okCallBack) {
        options.okCallBack()
      }
    },
    onCancel: () => {
      if (options.cancelCallBack) {
        options.cancelCallBack()
      }
    }
  }).show()
}

/**
 * 提示框
 * @param {type} 提示类型
 * @param {msg} 可以是文字或者html
 * @param {options} {"title":"","callBack":""}
 */
function toast (type, msg, options = {}) {
  options.time = options.time || 1500
  options.mask = options.mask || false
  Toast.$create({
    type: type,
    time: options.time,
    txt: msg,
    mask: options.mask,
    $events: {
      timeout: () => {
        if (options.callBack) {
          options.callBack()
        }
      }
    }
  }).show()
}
export default {
  /**
   * 弹出提示框
   */
  alert: function (msg, options) {
    dialog('alert', msg, options)
  },

  /**
   * 弹出确认框
   */
  confirm: function (msg, options) {
    dialog('confirm', msg, options)
  },

  /**
   * 弹出输入框
   * @param {msg} 可以是文字
   * @param {options} {"title":"","okCallBack":"","okLabel":"","cancelCallBack":"","cancelLabel":""}
   */
  prompt: function (msg, options = {}) {
    options.title = options.title || '提示信息'
    options.okLabel = options.okLabel || '确定'
    options.cancelLabel = options.cancelLabel || '取消'
    options.len = options.len || 24
    options.placeholder = options.placeholder || '请输入'
    let t = Dialog.$create({
      type: 'prompt',
      title: options.title,
      prompt: {
        value: msg,
        placeholder: options.placeholder,
        clearable: true,
        maxlength: options.len,
        ref: 'promptInput'
      },
      confirmBtn: {
        text: options.okLabel,
        active: true,
        disabled: false,
        href: 'javascript:;'
      },
      cancelBtn: {
        text: options.cancelLabel,
        active: false,
        disabled: false,
        href: 'javascript:;'
      },
      onConfirm: (e, promptValue) => {
        if (options.okCallBack) {
          options.okCallBack(promptValue, t)
        }
      },
      onCancel: (e, promptValue) => {
        if (options.cancelCallBack) {
          options.cancelCallBack(promptValue, t)
        }
      }
    }).show()
  },

  /**
   * 正确提示
   */
  correctToast: function (msg, options) {
    toast('correct', msg, options)
  },

  /**
   * 错误提示
   */
  errorToast: function (msg, options) {
    toast('error', msg, options)
  },

  /**
   * 警告提示
   */
  warnToast: function (msg, options) {
    toast('warn', msg, options)
  },

  /**
   * loading
   */
  loadingToast: function (msg, options) {
    toast('loading', msg, options)
  },

  /**
   * 无图标提示
   */
  txtToast: function (msg, options) {
    toast('txt', msg, options)
  }
}
