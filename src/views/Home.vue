<template>
  <!-- 布局容器 -->
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div class="myheader">
        <div>
          <i class="el-icon-star-off"></i>
          <span>后台管理系统</span>
        </div>
        <el-button size="small" type="info" plain @click="logout">退出<i class="el-icon-caret-right el-icon--right"></i></el-button>
      </div>
    </el-header>

    <el-container class="page-component__content">
      <!-- 左侧导航 -->
      <el-aside :width="isCollapse ? '79px' : '200px'">
        <el-menu unique-opened :collapse="isCollapse" :collapse-transition="false" router
                :default-active="$route.path" ref="menuRef"> 
          <!-- 折叠按钮 -->
          <i :class="isCollapse ? 'el-icon-caret-right' : 'el-icon-caret-left'" @click="toggleCollapse"
              class="collapse"></i>
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item in menus" :key="item.id">
            <template slot="title">
              <i :class="iconlist[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>

            <!-- 二级菜单 -->
            <!-- <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id"
                          @click="saveNavState('/' + subItem.path)"> -->
            <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧主体 -->
      <el-main>
        <!-- 回到顶部按钮 -->
        <el-backtop target="main" :bottom="40" :right="60" :visibility-height="200">
          <div>
            <i class="el-icon-caret-top"></i>
          </div>   
        </el-backtop>
        <!-- 路由占位符 -->
        <router-view>welcome</router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
// @ is an alias to /src
export default {
  name: 'Home',
  data() {
    return {
      // 菜单
      menus: [],
      // 一级菜单图标
      iconlist: {
        '125': 'el-icon-user',
        '103': 'el-icon-help',
        '101': 'el-icon-shopping-bag-1',
        '102': 'el-icon-s-order',
        '145': 'el-icon-data-analysis'
      },
      // 是否折叠
      isCollapse: false,
      // 被激活的链接地址
      // activePath: ''
    }
  },
  created() {
    this.getMenus(),
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    // 退出登录
    logout() {
      window.sessionStorage.clear();
      this.$router.push('/login')
      this.$message({
        message: '请登录',
        duration: 1000
      })
    },
    // 获取菜单
    async getMenus() {
      const {data: res} = await this.$http.get('/menus');
      if(res.meta.status !== 200) return this.$message.error({
        message: res.meta.msg,
        duration: 1000
      });
      this.menus = res.data;
      // console.log(res);
    },
    // 切换折叠状态
    toggleCollapse() {
      this.isCollapse =! this.isCollapse
    },
    // 保存链接的激活状态
    // saveNavState(activePath) {
    //   window.sessionStorage.setItem('activePath', activePath)
    //   this.activePath = activePath
    // }
    // 利用$route.path
    // 保存当前打开的一级菜单index
    // handleOpen(key) {
    //   window.sessionStorage.setItem('index', key)
    //   console.log(key);
    // }
  },
  watch: {
    $route() {
      if(this.$route.path == '/welcome') {
        // const i = window.sessionStorage.getItem('index')
        // this.$refs.menuRef.closeMenu(i)
        const arr = ['125', '103', '102', '101', '145']
        arr.forEach(i => {
          this.$refs.menuRef.close(i)
        })
        // console.log(i);
        // console.log(this.$refs.menuRef);
      }
    }
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
  .el-header {
    position: fixed;
    z-index: 1500;
    height: 50px !important;
    width: 100%;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08); 
    background-color: #fff;   
    .myheader {
      background-color: #fff;
      height: 50px;
      z-index: 1000;
      display: flex;
      justify-content: space-between;
      align-items: center; 
      >div {
        margin-left: -5px;
        i {
          transform: scale(1.3);
        }
        span {
          margin-left: 20px;
        }
      }
    }
  }
  .el-aside {
    box-shadow: 0 2px 4px rgba(0, 0, 0, .12);
    .el-menu {
      border-right: none;
      .collapse {
        color: #909399;
        margin-top: 18px;
        display: flex;
        justify-content: center;
        padding-left: 15px;
        cursor: pointer;
      }
      .el-submenu {
        [class^=el-icon-] {
          margin-right: 0 !important;
        }
        i {
          padding-left: 7.5px;
          padding-right: 7.5px;
        }
        span {
          margin-left: 5px;
        }
      }
    }
  }
  .el-main {
    padding-right: 35px;
    padding-bottom: 60px;
    // 防止滚动条挤压页面：
    overflow-y: overlay;
  }
}
</style>