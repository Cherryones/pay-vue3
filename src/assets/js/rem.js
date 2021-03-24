// 动态rem单位值
;(function () {
  // eslint-disable-next-line one-var
  var rem,
    dpr,
    time,
    doc = window.document,
    docEl = doc.documentElement,
    viewport = doc.querySelector('meta[name="viewport"]'),
    zoomScale,
    zoomScaleNum
  if (viewport) {
    zoomScale = viewport
      .getAttribute('content')
      // eslint-disable-next-line no-useless-escape
      .match(/initial\ -scale=(["']?)([\d\.]+)\1?/)
    if (zoomScale) {
      zoomScaleNum = parseFloat(zoomScale[2])
      dpr = parseInt(1 / zoomScaleNum, 10)
    }
  }
  if (!dpr && !zoomScaleNum) {
    // eslint-disable-next-line one-var
    var os =
        (window.navigator.appVersion.match(/android/gi),
        window.navigator.appVersion.match(/iphone/gi)),
      // eslint-disable-next-line no-redeclare
      dpr = window.devicePixelRatio
    dpr = os ? (dpr >= 3 ? 3 : dpr >= 2 ? 2 : 1) : 1
    zoomScaleNum = 1 / dpr
  }

  window.addEventListener(
    'resize',
    function () {
      clearTimeout(time)
      time = setTimeout(changeRem, 300)
    },
    false
  )

  // 改变基准rem
  function changeRem () {
    // 获取系统字体放大比例
    var fz = 40
    docEl.style.fontSize = fz + 'px'
    var realfz = +window.getComputedStyle(document.getElementsByTagName('html')[0]).fontSize.replace('px', '')
    var ratio = fz / realfz

    var docWidth = docEl.getBoundingClientRect().width
    if (docWidth / dpr > 540) {
      docWidth = 540 * dpr
    }
    // rem字号以320下的1rem=37.5px为基线进行等比缩放
    rem = (docWidth / 375) * 37.5
    docEl.style.fontSize = rem * ratio + 'px'
  }
  time = setTimeout(changeRem, 0)
})()
