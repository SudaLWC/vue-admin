<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>用户管理</el-breadcrumb-item>
    <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与查询区域 -->
      <el-row :gutter="40">
        <el-col :span="9">
          <el-input placeholder="请输入用户姓名" v-model="queryInfo.query" clearable
                    @clear="getUserList" @keyup.enter.native="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList">            
            </el-button>
          </el-input>                    
        </el-col>
        <el-col :span="4">
          <el-button class="adduser" type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表数据展示 -->
      <el-table :data="userlist" stripe border>
        <el-table-column type="index" align="center"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>

        <el-table-column label="状态">
          <template v-slot="scope">
            <el-switch v-model="scope.row.mg_state"
                      @change="userStateChanged(scope.row)">
            </el-switch>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200px" align="center">
          <template v-slot="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.id)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeUserById(scope.row.id)"></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip content="分配角色" placement="top" :enterable="false">             
              <el-button type="warning" size="mini" icon="el-icon-setting" @click="roleSet(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>      
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    <!--  -->
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="600px"
      @close="addDialogClosed">
      <!-- 对话框内容 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="120px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" show-password></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="600px"
      @close="editDialogClosed">
      <!-- 对话框内容 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="120px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色的对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="roleSetDialogVisible"
      width="600px"
      @close="roleSetDialogClosed">
      <!-- 对话框内容 -->
      <p>当前用户: &nbsp;&nbsp;&nbsp;{{userInfo.username}}</p>
      <p>当前角色: &nbsp;&nbsp;&nbsp;{{userInfo.role_name}}</p>
      <p>选择角色：
        <el-select v-model="roleSetId" placeholder="请选择">
          <el-option
            v-for="item in rolesList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id">
          </el-option>
        </el-select>
      </p>
      <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="roleSetDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleSet">确 定</el-button>
      </span>
    </el-dialog>
  <!--  -->
  </div>
</template>

<script>
export default {
  data() {
    // 验证邮箱规则
    var validateEmail = (rule, value, callback) => {
      // 设置验证邮箱的正则
      const regEmail = /^([a-zA-Z0-9_-])+@+([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/

      if(!regEmail.test(value)) {
        // 不合法邮箱返回错误
        return callback(new Error('请输入合法邮箱'))
      }
      // 验证通过返回回调函数
      callback()
    }
    // 验证手机号规则
    var validateMobile = (rule, value, callback) => {
      // 设置验证手机号的正则
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

      if(!regMobile.test(value)) {
        // 不合法手机号返回错误
        return callback(new Error('请输入合法手机号'))
      }
      // 验证通过返回回调函数
      callback()
    }

    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      userlist: [],
      total: 0,
      // 添加用户对话框状态
      addDialogVisible: false,
      // 添加用户表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 表单规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: validateEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: validateMobile, trigger: 'blur' }
        ]
      },
      // 修改用户对话框状态
      editDialogVisible: false,
      // 修改用户表单信息
      editForm: {},
      // 修改用户表单规则 
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: validateEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: validateMobile, trigger: 'blur' }
        ]
      },
      // 分配角色对话框的状态 
      roleSetDialogVisible: false,
      // 要分配角色的用户信息 
      userInfo: {},
      // 角色列表信息 
      rolesList: [],
      // 分配新角色的id
      roleSetId: ''
    }
  },
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
      // console.log(res.data);
    },
    // 监听每页多少条
    handleSizeChange(newSize) {
      // console.log(newSize);
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听当前页码
    handleCurrentChange(newPage) {
      // console.log(newPage);
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听用户状态改变
    async userStateChanged(userInfo) {
      // console.log(userInfo);
      const {data: res} = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      // console.log(res);
      if(res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error({
          message: res.meta.msg,
          duration: 1000
        })
      }
      this.$message.success({
        message: res.meta.msg,
        duration: 1000
      })
    },
    // 监听添加用户对话框关闭
    addDialogClosed() {
      // 重置表单
      this.$refs.addFormRef.resetFields()
    },
    // 监听添加用户按钮
    addUser() {
      // 网络请求预验证
      this.$refs.addFormRef.validate(async valid => {
        // console.log(valid);
        if(!valid) return
        // 验证通过，发起添加用户的网络请求
        const {data: res} = await this.$http.post('users', this.addForm)
        // console.log(res);
        if(res.meta.status !== 201) {
          this.$message.error({
            message: res.meta.msg,
            duration: 1000
          })
        }
        this.$message.success({
          message: res.meta.msg,
          duration: 1000
        })
        // 隐藏对话框
        this.addDialogVisible = false
        // 刷新用户列表
        this.getUserList()
      })
    },
    // 展示修改用户对话框
    async showEditDialog(id) {
      // console.log(id);
      const {data: res} = await this.$http.get('users/' + id)
      if(res.meta.status !== 200) {
        return this.$message.error({
          message: '查询用户信息失败',
          duration: 1000
        })
      }
      this.editDialogVisible = true
      this.$nextTick(() => {
        this.editForm = res.data
      })
    },
    // 监听修改用户对话框关闭
    editDialogClosed() {
      // 不需要// 重置表单
      // this.$refs.editFormRef.resetFields()
      // 去除校验
      this.$refs.editFormRef.clearValidate()
    },
    // 预验证修改用户信息并提交
    editUserInfo() {
      // 提交修改信息前验证
      this.$refs.editFormRef.validate(async valid => {
        if(!valid) return
        // 验证通过后发起请求
        const {data: res} = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email, mobile: this.editForm.mobile
        })
        // 修改信息失败
        if(res.meta.status !== 200) {
          return this.$message.error({
            message: '更新用户信息失败',
            duration: 1000
          })
        }
        // 修改信息成功后：
        // 关闭对话框
        this.editDialogVisible = false
        // 刷新用户信息
        this.getUserList()
        // 提示成功
        this.$message.success({
          message: '更新用户信息成功',
          duration: 1000
        })
      })
    },
    // 删除id对应的用户信息
    async removeUserById(id){ 
      // console.log(id);
      // 弹框询问是否删除
      const confirmRes = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if(confirmRes !== 'confirm') {
        return this.$message({
          message: '已取消删除',
          duration: 1000
        })
      }
      // 点击确认删除
      const {data: res} = await this.$http.delete('users/' + id)
      if(res.meta.status !== 200) {
        return this.$message.error({
          message: '删除用户失败!',
          duration: 1000
        })
      }
      // 删除用户成功：提示成功，刷新列表
      this.$message.success({
        message: '删除用户成功!',
        duration: 1000
      })
      this.getUserList()
    },
    // 显示分配角色对话框
    async roleSet(userInfo) {
      // console.log(userInfo);
      this.userInfo = userInfo
      // 获取所有角色列表
      const {data: res} = await this.$http.get('roles')
      if(res.meta.status !== 200) {
        return this.$message.error({
          message: '获取角色列表失败',
          duration: 1000
        })
      }
      this.rolesList = res.data

      this.roleSetDialogVisible = true
    },
    // 确认分配发送请求
    async saveRoleSet() {
      const {data: res} = await this.$http.put(`users/${this.userInfo.id}/role`,{rid: this.roleSetId})
      if(res.meta.status !== 200) {
        return this.$message.error({
          message: '分配角色失败!',
          duration: 1000
        })
      }
      // console.log(res);
      this.$message.success({
        message: '分配角色成功!',
        duration: 1000
      })
      // 成功后刷新列表,关闭对话框
      this.getUserList()
      this.roleSetDialogVisible = false
    },
    // 分配角色对话框关闭清除数据
    roleSetDialogClosed() {
      this.roleSetId = '',
      this.userInfo = {}
    }
  }
}
</script>

<style lang="less" scoped>
.adduser {
  padding-left: 15px;
  padding-right: 13px;
  font-size: 14px;
  letter-spacing: .8px;
}
.el-input {
  width: 350px;
}
</style>