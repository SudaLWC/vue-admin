<template>
  <div class="login-page">
    <div class="login-box">
      <!-- 表单头部 -->
      <div class="login-avatar">
        <img src="../assets/images/logo.png" alt="avatar">
      </div>
      <!-- 表单区 -->
      <el-form ref="formRef" :rules="loginRules" :model="loginForm" label-width="0px" class="login-form">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input placeholder="用户名" type="text" v-model="loginForm.username" prefix-icon="el-icon-user-solid"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input placeholder="密码" show-password v-model="loginForm.password" prefix-icon="el-icon-lock"></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button @click="login" type="primary">登录</el-button>
          <el-button @click="resetForm" type="info">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      // 表单数据绑定
      loginForm: {
        username:'admin',
        password:'123456'
      },
      // 表单验证规则
      loginRules: {
        username: [
          {required: true, message: '请输入登录用户名', trigger: 'blur'},
          {min: 3, max: 10, message: '用户名必须在 3 ~ 10 个字符之间', trigger: 'blur'}
        ],
        password: [
          {required: true, message: '请输入登录密码', trigger: 'blur'},
          {min: 6, max: 12, message: '密码必须在 6 ~ 12 个字符之间', trigger: 'blur'}
        ]
      }
    }
  },
  methods: {
    // 重置表单
    resetForm() {
      this.$refs.formRef.resetFields()
    },
    // 登录
    login() {
      this.$refs.formRef.validate(async valid => {
        // console.log(valid);
        if(!valid)return;
        const {data: res} = await this.$http.post('login',this.loginForm);
        if(res.meta.status !== 200) return this.$message.error({
          message: res.meta.msg,
          duration: 1000
        });
        this.$message.success({
          message: res.meta.msg,
          duration: 1000
        })
        // console.log(res);
        // 保存token
        window.sessionStorage.setItem('token',res.data.token);
        // 跳转页面
        this.$router.push('/home')
      })
    }
  }

}
</script>

<style lang="less" scoped>
  .login-page {
    display: flex;
    height: 100%;
    background: url(https://cdn.jsdelivr.net/gh/SudaLWC/picTest@1.0/bgc.jpg);
    background-size: cover;
  }
  .login-box {
    margin: auto;
    width: 450px;
    height: 300px;
    background-color: rgba(255, 255, 255, .3);
    border-radius: 10px;
    box-shadow: 0 0 2px rgb(90, 145, 155);
    
    .login-avatar {
      margin: -3px auto;
      height: 50px;
      width: 100px;
      img {
        height: 100%;
        width: 100%;
      }
    }
    .login-form {
      padding: 0 60px;
      margin-top: 50px;
      .btns {
        display: flex;
        justify-content: flex-end;
      }
    }
  }
</style>