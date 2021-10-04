<template>
  <div id="app">
      <!-- <button @click="getData">请求数据</button> -->
    <router-view/>
    <!-- <el-backtop :bottom="50" :right="25" :visibility-height="250">
      <div>
        <i class="el-icon-caret-top"></i>
      </div>   
    </el-backtop> -->
  </div>
</template>

<script>
export default {
  // data() {
  //   return {
  //     loginForm: {
  //       username: 'admin',
  //       password: '123456'
  //     }
  //   }
  // },
  // methods: {
  //   // getData() {
  //   //   this.$http.post('login', this.loginForm).then(({data: res}) => {
  //   //     console.log(res);
  //   //   })
  //   // }
  // }
}
</script>

<style>
</style>
