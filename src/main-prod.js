// import Vue from 'vue'
import App from './App.vue'
import router from './router'
import dayjs from 'dayjs'
import ZkTable from 'vue-table-with-tree-grid'

import './assets/css/global.css'

// import NProgress from 'nprogress'
// import 'nprogress/nprogress.css'

// import axios from 'axios'
// 请求根路径
axios.defaults.baseURL = 'https://lianghj.top:8888/api/private/v1'
// 请求拦截 ,在request拦截器中 展示进度条 Nprogress.start()
axios.interceptors.request.use(config => {
  NProgress.start();
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
axios.interceptors.response.use(config => {
  // 隐藏进度条
  NProgress.done();
  return config
})
// 全局注册axios
Vue.prototype.$http = axios
// 全局注册树状表格
Vue.component('tree-table', ZkTable)
// 全局过滤器设置日期格式化
Vue.filter('timeFormater',function(value, str='YYYY-MM-DD HH:mm:ss') {
  return dayjs(value).format(str)
}) 

// import VueQuillEditor from 'vue-quill-editor' //导入富文本编辑器
// 全局注册富文本编辑器
Vue.use(VueQuillEditor, /* { default global options } */)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
