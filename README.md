# vue-admin

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### 项目完成

#### 项目优化策略

1. 生成打包报告

2. 第三方库启用 CDN

3. Element UI 组件按需加载
4. 路由懒加载

5. 首页内容定制

- 项目发布阶段去除console

  安装插件babel-plugin-transform-remove-console，

  在babel.config.js中配置

```
// 定义项目发布阶段需要使用的 babel 插件
const prodPlugins = []
if(process.env.NODE_ENV === 'production') {
  prodPlugins.push('transform-remove-console')
}

module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset',
    ["@babel/preset-env", { "modules": false }]
  ],
  plugins: [
    [
      "component",
      {
        "libraryName": "element-ui",
        "styleLibraryName": "theme-chalk"
      },
      // 使用展开运算符配置发布阶段的插件数组
      ...prodPlugins
    ]
  ]
}
```

- 使用vue ui可视化面板生成打包报告

- 通过创建vue.config.js修改webpack打包发布过程自定义配置

  在 vue.config.js 导出的配置对象中，新增 configureWebpack 或 chainWebpack 节点，来自定义 webpack 

  的打包配置。

  在这里， configureWebpack 和 chainWebpack 的作用相同，唯一的区别就是它们修改 webpack 配置的方

  式不同：

  ①  chainWebpack 通过链式编程的形式，来修改默认的 webpack 配置

  ②  configureWebpack 通过操作对象的形式，来修改默认的 webpack 配置

  两者具体的使用差异，可参考如下网址：

  https://cli.vuejs.org/zh/guide/webpack.html#webpack-%E7%9B%B8%E5%85%B3

#### 项目上线相关配置

1. 通过node创建web服务器

2. 开启gzip配置

3. 配置https服务

4. 使用pm2管理应用

- ```
  const express = require('express')
  // 导入gzip网络传输压缩
  const compression = require('compression')
  const app = express()
  
  // 启用gzip中间件*必须在托管静态资源之前
  app.use(compression())
  // 托管静态资源
  app.use(express.static('./dist'))
  
  
  app.listen(8000, () => {
      console.log('vue-admin_server running at http://localhost:8000/');
  })
  
  // pm2 node进程管理工具（可以在后台运行）
  // npm i pm2 -g 全局安装pm2
  // pm2命令
  //   pm2 start \app.js --name 添加并启动进程
  //   pm2 stop name(id)  停止进程
  //   pm2 restart name(id) 重启进程
  //   pm2 delete name(id) 删除进程
  // https://pm2.keymetrics.io/docs/usage/quick-start/
  ```

  