'user strict'

/**
 * 公共函数封装
 * author:qinyifang@XGD.com
 */
export default {
  install (Vue) {
    /**
     * 判断字符串是否为空
     */
    Vue.prototype.isEmpty = function (str) {
      if (str === null || str === undefined || str.length === 0) {
        return true
      }
      return false
    }

    /**
     * 删除左右两端的空格
     */
    Vue.prototype.trim = function (str) {
      return str.replace(/(^\s*)|(\s*$)/g, '')
    }

    /**
     * 删除全部空格
     */
    Vue.prototype.trimAll = function (str) {
      let result
      result = this.trim(str)
      result = result.replace(/\s/g, '')
      return result
    }

    /**
     * 扩展date函数
     */
    // eslint-disable-next-line no-extend-native
    Date.prototype.format = function (format) {
      const o = {
        'M+': this.getMonth() + 1,
        'd+': this.getDate(),
        'h+': this.getHours(),
        'm+': this.getMinutes(),
        's+': this.getSeconds(),
        'q+': Math.floor((this.getMonth() + 3) / 3),
        'S': this.getMilliseconds()
      }
      if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, `${this.getFullYear()}`.substr(4 - RegExp.$1.length))
      }
      for (const k in o) {
        if (new RegExp(`(${k})`).test(format)) {
          format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : `00${o[k]}`.substr(String(o[k]).length))
        }
      }
      return format
    }

    /**
     * Date 为long类型
     * pattern 为格式化参数
     */
    Vue.prototype.getFormatDate = function (date, pattern) {
      if (date === undefined) {
        return ''
      }
      if (typeof date === 'number') {
        date = new Date(date)
      }
      if (pattern === undefined) {
        pattern = 'yyyy-MM-dd hh:mm:ss'
      }
      return date.format(pattern)
    }

    /**
     * 以分为单位的金额转换为以元为单位
     * @param money 以分为单位的金额
     * @returns
     */
    Vue.prototype.getFormatYuanMoney = function (money) {
      if (this.isEmpty(money)) {
        return ''
      }
      money = String(money)
      if (money.indexOf('.') >= 0) {
        return money
      }
      let flag = ''
      let result = ''
      if (money.substring(0, 1) === '-' || money.substring(0, 1) === '+') {
        flag = money.substring(0, 1)
        money = money.substring(1)
      }
      const len = money.length
      if (len === 1) {
        result = `0.0${money}`
      } else if (len === 2) {
        result = `0.${money}`
      } else {
        result = `${money.substring(0, len - 2)}.${money.substring(len - 2)}`
      }
      return flag + result
    }

    /**
     * 以分为单位的金额转换为以元为单位(整数部分加千分号)
     * @param money 以分为单位的金额
     * @returns
     */
    Vue.prototype.getFormatYuanAmt = function (money) {
      let amt = this.getFormatYuanMoney(money)
      if (this.isEmpty(amt)) {
        return ''
      }
      let flag = ''
      if (amt.substring(0, 1) === '-' || amt.substring(0, 1) === '+') {
        flag = amt.substring(0, 1)
        amt = amt.substring(1)
      }

      // 取整数部分增加千分号
      const yuan = amt.substr(0, amt.indexOf('.'))
      const fen = amt.substr(amt.indexOf('.') + 1)
      let fmtYuan = ''
      const len = yuan.length
      for (let i = 1; i < len; i++) {
        fmtYuan = yuan.substr(len - i, 1) + fmtYuan
        if (i % 3 === 0) {
          fmtYuan = `,${fmtYuan}`
        }
      }
      fmtYuan = yuan.substr(0, 1) + fmtYuan

      return `${flag + fmtYuan}.${fen}`
    }

    /**
     * 以元为单位的金额转换为以分为单位
     * @param money 以元为单位的金额
     * @returns
     */
    Vue.prototype.getFormatFenAmt = function (money) {
      if (this.isEmpty(money)) {
        return ''
      }
      money = `${money}`

      // 剔除千分号
      money = money.replace(/[,]/g, '')

      const idx = money.indexOf('.')
      if (idx > 0) {
        let yuan = money.substr(0, idx)
        let fen = money.substr(idx + 1)
        if (fen.length === 0) {
          fen = '00'
        } else if (fen.length === 1) {
          fen = fen + '0'
        } else if (fen.length > 2) {
          fen = fen.substr(0, 2)
        }
        if (yuan === '0') {
          if (fen.slice(0, 1) === '0') {
            return fen.slice(1)
          } else {
            return fen
          }
        } else {
          return yuan + fen
        }
      } else if (idx === 0) {
        let fen = money.substr(1)
        if (fen.length === 0) {
          fen = '00'
        } else if (fen.length === 1) {
          fen = fen + '0'
        } else if (fen.length > 2) {
          fen = fen.substr(0, 2)
        }
        return fen
      }
      return `${money}00`
    }

    /**
     * 存储localstarage
     */
    Vue.prototype.setLocal = function (k, v) {
      const key = escape(k)
      const val = escape(JSON.stringify(v))

      /*
       * Const key=k;
       * const val=JSON.stringify(v);
       */
      localStorage.setItem(key, val)
    }

    /**
     * 获取localstarage
     */
    Vue.prototype.getLocal = function (k) {
      const key = escape(k)
      const val = JSON.parse(unescape(localStorage.getItem(key)))

      /*
       * Const key=k;
       * const val=JSON.parse(localStorage.getItem(key));
       */
      return val
    }

    /**
     * 移除localstarage
     */
    Vue.prototype.removeLocal = function (k) {
      // Const key=escape(k);
      const key = k
      localStorage.removeItem(key)
    }

    /**
     * 移除所有localstarage
     */
    Vue.prototype.removeAllLocal = function () {
      localStorage.clear()
    }

    /**
     * 存储sessionstarage
     */
    Vue.prototype.setSession = function (k, v) {
      const key = escape(k)
      const val = escape(JSON.stringify(v))

      /*
       * Const key=k;
       * const val=JSON.stringify(v);
       */
      sessionStorage.setItem(key, val)
    }

    /**
     * 获取sessionstarage
     */
    Vue.prototype.getSession = function (k) {
      const key = escape(k)
      const val = JSON.parse(unescape(sessionStorage.getItem(key)))

      /*
       * Const key=k;
       * const val=JSON.parse(sessionStorage.getItem(key));
       */
      return val
    }

    /**
     * 删除sessionstarage
     */
    Vue.prototype.removeSession = function (k) {
      sessionStorage.removeItem(k)
    }

    /**
     * 删除 all sessionstarage
     */
    Vue.prototype.removeAllSession = function () {
      sessionStorage.clear()
    }

    // 获取URL请求参数公共方法
    Vue.prototype.getQueryString = function (arg) {
      let reg = new RegExp('(^|&)' + arg + '=([^&]*)(&|$)', 'i')
      let r = window.location.search.substr(1).match(reg)
      if (r != null) {
        return unescape(r[2])
      }
      return null
    }

    // 禁用后退按钮
    Vue.prototype.disableHistory = function (url) {
      history.pushState(null, null, url)
      window.addEventListener('popstate', function () {
        history.pushState(null, null, url)
      })
    }
  }
}
