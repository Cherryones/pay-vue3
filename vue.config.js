const path = require('path')

module.exports = {
  publicPath: process.env.BASE_URL,
  outputDir: path.resolve(__dirname, `./dist/${process.env.VUE_APP_DIRNAME}`),
  pages: {
    index: {
      entry: 'src/main.js',
      title: '向商户付款',
    },
  },
  devServer: {
    proxy: {
      '^/api': {
        target: process.env.VUE_APP_API_ROOT,
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      },
      '^/board': {
        target: process.env.VUE_APP_API_ROOT_BOARD,
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          '^/board': ''
        }
      }
    }
  },
  css: {
    loaderOptions: {
      stylus: {
        'resolve url': true,
        'import': [path.resolve(__dirname, './src/assets/style/theme')]
      }
    }
  },
  pluginOptions: {
    'cube-ui': {
      postCompile: true,
      theme: true
    }
  },
  // 开启webpack配置
  configureWebpack: config => {
    config.mode = process.env.NODE_ENV === 'development' ? process.env.NODE_ENV : 'production',
    config.devtool = process.env.VUE_APP_DEV_TOOL_CONFIG

    if (process.env.NODE_ENV !== 'development') {
      config.output.filename = 'js/[name].[contenthash:8].js'
      config.output.chunkFilename = 'js/[name].[contenthash:8].js'
    }
  }
}
