# vue-admin

* 项目运行

```
npm install
npm run serve
```

## 项目开始

1. 创建一个Login组件

   * 三标签：结构 `<template>(模板)`  行为 `<script>`  样式(支持 less 并且具有作用域)` <style lang="less" scoped>`  或使用用户代码片段

   ```
   <template>
     
   </template>
   
   <script>
   export default {
   
   }
   </script>
   
   <style lang="less" scoped>
   
   </style>
   ```

2. 创建路由组件，并且使用重定向 `redirect` 如果用户访问的是`'/'`，会重定向到登录组件`Login.vue`

   ```
   const routes = [
     {
       path: '/',
       redirect: '/login'
     }
   ]
   ```

3. 使用 element-ui 按需加载进行页面设计和布局

   * element-ui 提供的组件，每个组件名都是它自己的类名

4. 分支的推送：把本地分支推送到远程仓库上`git push`

   * 如果远程仓库没有本地的分支则可以使用  `git push -u remote branch`  
   * 切换分支 -> 提交分支 -> 回到主分支合并分支 -> 推送主分支
   * `pull`
### Login组件

  1. 使用 element-ui 设置登录框，背景居中，样式居中
  2. 在 `plugins`文件夹下的`element.js` 引入并且配置 `Button` `Form` `FormItem` `Input`

* `<el-form>` `<el-form-item label="用户名">`(可使用label属性定义左侧标题)
	
	* 使用 el-icon
	
	* 将属性数据绑定到表单form的对象中， `loginForm`的数据保存在data中  
	
	  ```
	  <el-form ref="formRef" :rules="loginRules" :model="loginForm" label-width="0px" class="login-form">
	  ```
	
	* 在表单项中通过 v-model 双向绑定表单对象的属性
	
	  ```
	  <el-input placeholder="用户名" type="text" v-model="loginForm.username" prefix-icon="el-icon-user-solid"></el-input> 
	  ```
	
	* 表单的数据验证(示例)： 给表单`<el-form>`绑定`:rules="rule"`属性校验`rule`存放在`data`中 
		
		` rules: { name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }] }`
		
		* `required` 必填不能为空 `message` 错误消息提示 `trigger`触发事件 `min/max` 最小/大输入长度
		
		* 通过`prop`属性调用验证：给 `<el-form-item>` 添加而不是里面的标签 `<el-input>` 
		
		  `<el-form-item prop="name">`
		
		* 表单的重置： 给表单绑定`ref`属性并且通过`$refs`拿到组件对象`<el-form ref='formRef'>`，通过点击事件使用表单上自带的重置方法`resetFields()`
		
		  ```
		  resetForm() {
		        this.$refs.formRef.resetFields()
		  }
		  ```

### Home组件

* 表单的预验证：`$refs`拿到组件对象使用`validate` 方法

	* 引入`axios`并赋值给`Vue`的原型(全局配置) `Vue.prototype.$http = axios`
	* 验证通过后发送`axios`请求
* 消息提示：全局配置message方法`Vue.prototype.$message = Message` error失败success成功
* 登录成功将获取到的`token`保存到客户端的`sessionStorage`中(会话机制/只在当前页面生效)或者`localStorage`(持久话机制/关闭页面也不会忘记数据)
* `window.sessionStorage.setItem('token', res.data.token)` 因为除了登录界面都需要`token`来验证操作，所以登录时会保存`token`作为身份验证
* 保存`token`后自动跳转到后台界面，使用`this.$router.push('/home')`
* 防止别人直接访问`login`以外的路由，使用路由导航守卫 `beforeEach` 离开当前路由之前检查是否存有`token`如果没有就直接跳转到`login`页面
* `router.beforeEach((to, from, next) => {})`
  * to 即将跳转到哪里
  * from 从哪里跳转
  * next 放行
* 退出登录：在`home`页面右上角设置按钮，清空`token`并且跳转到`login`路由
* 布局容器: `el-container` `el-header` `el-aside` `el-main`

#### 左侧部分

`<el-aside>`

* 左侧可折叠菜单 `<el-menu>`(最外层包裹菜单)
  * 一级菜单`<el-submenu>`
  * 二级菜单 `<el-menu-item>` 
  * 菜单的模板 `<template>` 

* 请求拦截器：必须在请求头中使用 `Authorization` 字段提供 `token` 令牌
  
```
  axios.interceptors.request.use(config => {
    NProgress.start();
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config
  })
  ```
  
  * login 不需要 token 可以直接登录，登录进去后每次操作/请求都会验证 `Authorization` 的 token令牌
  
* 创建完成后`this.$http.get('/menus')`获取左侧菜单栏的数据 ，使用`async` `await`简化 promise
  
  ```
      async getMenus() {
        const {data: res} = await this.$http.get('/menus');
        if(res.meta.status !== 200) return this.$message.error({
          message: res.meta.msg,
          duration: 1000
        });
        this.menus = res.data;
      }
  ```
  
  * 使用 v-for 来遍历生成数据，第一级使用不同的 icon 的解决：定义一个对象来存放字体图标需要的类名  
  
    ```
    iconlist: {
            '125': 'el-icon-user',
            '103': 'el-icon-help',
            '101': 'el-icon-shopping-bag-1',
            '102': 'el-icon-s-order',
            '145': 'el-icon-data-analysis'
          }
    ```
  
  * 菜单栏只打开一个的可以给`el-menu` 添加 `unique-opened` 属性 
  
  * 折叠属性： `:collapse="isCollapse"` 
  
  * 关闭过渡动画属性： `:collapse-transition="false"` | 
  
  * 左侧边栏的宽度变化 (利用三元表达式)：
  
    `<el-aside :width="isCollapse ? '79px' : '200px'">`
  
  * 子菜单的跳转：
    
    * `el-menu`的`router`属性开启路由跳转
    
    * `el-submenu`/`el-menu-item`的 `index`属性控制跳转地址
    
      ```
      <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id">
      ```
    
    * components 里面的组件都是作为`Home.vue`的子组件展示的
    
  * 左侧导航激活的高亮
  
    * 给`el-menu`添加`:default-active`属性，并且绑定当前路径
  
      `:default-active="$route.path"`

#### 主体部分

`<el-main>`

##### 用户管理

  * 面包屑导航 `<el-breadcrumb>` : 首页 > 用户管理 > 用户列表

  * 卡片视图区域`el-card` 

     * 搜索与查询区域

       * 使用栅栏布局`<el-row>` `<el-col>`

       * 使用 `<el-input>`复合框

     * 用户列表数据展示

       * 获取用户数据

         ```
         created() {
           this.getUserList()
         },
         methods: {
         // 获取用户列表数据
           async getUserList() {
             const {data: res} = await this.$http.get('users', {
               params: this.queryInfo
             })
             if(res.meta.status !== 200){
               return this.$message.error({
                 message: res.meta.msg,
                 duration: 1000
               });
             }
             this.userlist = res.data.users
             this.total = res.data.total
             console.log(res.data);
           }
         }
         ```

       * 表格数据

         `<el-table :data="数据源" stripe(隔行变色) border(边框)>` `<el-table-column prop="数据名" label="列标题">`

       * 状态切换按钮(使用作用域插槽)

         在`<el-table-column>` 添加`template`模板再使用`v-slot`属性拿到当前槽作用域的布尔值 Boolean 再通过`<el-switch>`组件显示

         而在 `<el-table-column>` 使用了作用域插槽，会覆盖当前层的`prop`属性，所以可以删除`prop `

     * 分页区域 `<el-pagination>`

       每页条数选择器`:page-sizes="[1, 2, 5, 10]"`	

       每页显示条数 `:page-size="queryInfo.pagesize"`

       功能属性`layout="total, sizes, prev, pager, next, jumper"`

       * 总数，条数选择器，上一页，页面输入，下一页，跳转按钮

       显示条数的修改 

       ```
       handleSizeChange(newSize) {
         console.log(newSize);
         this.queryInfo.pagesize = newSize
         this.getUserList()
       }
       ```

       监听页码的改变

       ```
       handleCurrentChange(newPage) {
         // console.log(newPage);
         this.queryInfo.pagenum = newPage
         this.getUserList()
       }
       ```

  * 按钮状态的修改：通过`<el-switch>`的`@chang`改变事件触发回调函数

  * `$nextTick(() => {})` 将回调函数延迟在下一次DOM更新数据后调用，即当数据更新了在DOM中渲染后自动执行该函数。 

  * 搜索功能

     * 给搜索框双向绑定到 `queryInfo.query` ，搜索按钮绑定点击事件`@click`发送用户数据请求
     * 清空搜索框使用`<el-input>`的`clearable`属性
     * 使用`<el-input>`的`@clear`事件重新获取数据列表

  * 控制对话框显示隐藏属性`:visible.sync = DialogVisible `

     `DialogVisible` 为Boolean保存在`data`中

* 添加用户使用`validate()`方法判断数据是否合法，值是 true 就发送 post 请求，否则直接返回结束函数
  
  * post 请求方式 `if(res.meta.status == 201) `则创建成功
  
  * 对话框的代码可以放到外面，只需要使用`@click`来变换 Boolean 就可以做到显示和隐藏
  
* 修改用户信息
     
     * 使用作用域插槽，点击按钮传id值，发送 get 请求获取当前id的用户数据，并将数据保存起来
     
     * 点击确认按钮进行表单预验证，将保存的数据作为修改参数，发送 put 请求
     
* 删除用户(点击删除按钮，弹出对话框，确认是否删除)

* * 全局配置MessageBox`Vue.prototype.confirm = MessageBox .confirm`

##### 权限管理

* 添加两个`/home`的子路由`/rights` `/roles` 

* 权限列表：`<el-table>`展示数据

* 角色列表：  
  * `<el-table-column>` 使用`expand`属性展开行，使用`index`添加索引列
  


* 展开的设置：使用栅栏布局，嵌套 for 循环，遍历 children 

* Tree 树形结构：
  
  * 绑定的数据源`:data`
  * 展示的属性名`:prop`
  * 以复选框的形式`show-checkbox` 
  * 绑定id`node-key="id"`
  
  * 默认选中`:default-checked-keys="defKeys"`
  
  * 利用递归获取相应角色下三级权限节点的id
    
    ```
    getLeafKeys(node, arr) {
      if(!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      });
    }
    ```
    
    * 递归{结束的条件，自己调用自己}

##### 商品分类

* 树形表格(tree-table)：element-ui 没有树形表格，使用 `vue-table-with-tree-grid` 
  * columns { label  template  type  prop }   --  show-index   index-text


* 级联选择器(必须选择三级分类)判断绑定的数组长度，!=3 表示没有选择对应的三级子级，则清空数组 

* 接收参数前处理`attr_vals`，以","分割成数组，再由 v-for 循环遍历，配合组件渲染

  ```
  res.data.forEach(item => {
    item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
  })
  ```

* 图片的上传`<el-upload>`



* 富文本编辑器`vue-quill-editor`

## 项目完成

### 项目优化策略

1. 生成打包报告

2. 第三方库启用 CDN

3. Element UI 组件按需加载
4. 路由懒加载

5. 首页内容定制

- 项目发布阶段去除console

  安装插件`babel-plugin-transform-remove-console`

  在`babel.config.js`中配置

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

- 使用`vue ui`可视化面板生成打包报告

- 通过创建`vue.config.js`修改`webpack`打包发布过程自定义配置

  在`vue.config.js`导出的配置对象中，新增`configureWebpack`或`chainWebpack`节点，来自定义` webpack `的打包配置。

  在这里，`configureWebpack`和`chainWebpack`的作用相同，唯一的区别就是它们修改`webpack`配置的方

  式不同：

  ①`chainWebpack`通过链式编程的形式，来修改默认的`webpack`配置

  ②`configureWebpack`通过操作对象的形式，来修改默认的`webpack`配置

  两者具体的使用差异，可参考如下网址：

  https://cli.vuejs.org/zh/guide/webpack.html#webpack-%E7%9B%B8%E5%85%B3

### 项目上线相关配置

1. 通过node创建web服务器

2. 开启`gzip`配置

3. 配置`https`服务

4. 使用`pm2`管理应用

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
  //   pm2 ls 查询进程列表
  // https://pm2.keymetrics.io/docs/usage/quick-start/
  ```