import BrowserLogger from 'alife-logger'
const logger = (()=>{
  if (process.env.NODE_ENV === 'production') {
    try {
      return BrowserLogger.singleton({
        pid: 'ctrohyonq4@2372b4efe51ebfb',
        appType: 'web',
        imgUrl: 'https://arms-retcode.aliyuncs.com/r.png?',
        sendResource: true,
        enableLinkTrace: true,
        behavior: true
      })
    } catch (e) {
      console.error('init logger fail', e)
    }
  } else {
    return {
      error () {}
    }
  }

})()
export default logger
