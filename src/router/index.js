import Vue from 'vue'
import VueRouter from 'vue-router'
// import Home from '../views/Home.vue'
// import Login from '../views/Login.vue'
// import Welcome from '../components/Welcome.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../views/Login.vue')
  },
  {
    path: '/home',
    component: () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../views/Home.vue'),
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/Welcome.vue')
      },
      {
        path: '/users', 
        component: () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/user/Users.vue')
      },
      {
        path: '/rights', 
        component: () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/authority/Rights.vue')
      },
      {
        path: '/roles', 
        component: () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/authority/Roles.vue')
      },
      {
        path: '/categories', 
        component: () => import(/* webpackChunkName: "Categories_Params" */ '../components/commodity/Categories.vue')
      },
      {
        path: '/params', 
        component: () => import(/* webpackChunkName: "Categories_Params" */ '../components/commodity/Params.vue')
      },
      {
        path: '/goods', 
        component: () => import(/* webpackChunkName: "Goods_Add" */ '../components/commodity/Goods.vue')
      },
      {
        path: '/goods/add', 
        component: () => import(/* webpackChunkName: "Goods_Add" */ '../components/commodity/Add.vue')
      },
      {
        path: '/orders', 
        component: () => import(/* webpackChunkName: "Orders_Report" */ '../components/orders/Orders.vue')
      },
      {
        path: '/reports', 
        component: () => import(/* webpackChunkName: "Orders_Report" */ '../components/reports/Reports.vue')
      }
    ]
  }
  // {
  //   path: '/about',
  //   name: 'About',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  // }
]

const router = new VueRouter({
  routes
})
// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  if (to.path == '/login') return next();
  const token = window.sessionStorage.getItem('token');
  if (!token) return next('/login');
  next()
})

export default router
