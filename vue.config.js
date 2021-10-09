// vue.config.js
module.exports = {
  lintOnSave: false,

  devServer: {
    overlay: {
      warnings: false,
      errors: false
    }
  },

  chainWebpack: config => {
    // 发布模式
    config.when(process.env.NODE_ENV === 'production', config => {
      config
        .entry('app')
        .clear()
        .add('./src/main-prod.js')

      config.set('externals',{
        vue: 'Vue',
        'vue-router': 'VueRouter',
        'vue-table-with-tree-grid': 'ZkTable',
        nprogress: 'NProgress',
        axios: 'axios',
        'vue-quill-editor': 'VueQuillEditor',
        echarts: 'echarts',
        lodash: '_'
      })

      config.plugin('html').tap(args => {
        args[0].isProd = true
        return args
      })
    })

    // 开发模式
    config.when(process.env.NODE_ENV === 'development', config => {
      config.entry('app').clear().add('./src/main-dev.js')

      config.plugin('html').tap(args => {
        args[0].isProd = false
        return args
      })
    })
  }
}