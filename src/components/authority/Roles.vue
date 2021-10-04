<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>权限管理</el-breadcrumb-item>
    <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button class="addrole" type="primary" @click="addRole">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <!-- 遍历一级权限 -->
            <el-row :class="['bdbottom', index1 == 0 ? 'bdtop' : '', 'vertical-center']"
                    v-for="(item1, index1) in scope.row.children" :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id, {}, {})">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row :class="[index2 == 0 ? '' : 'bdtop', 'vertical-center']"
                        v-for="(item2, index2) in item1.children" :key="item2.id">
                  <!-- 渲染二级权限 -->
                  <el-col :span="6">
                    <el-tag closable @close="removeRightById(scope.row, item2.id, item1, {})" type="success">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id"
                            closable @close="removeRightById(scope.row, item3.id, item2, item1)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>
              {{scope.row}}
            </pre> -->
          </template>
        </el-table-column>
        
        <el-table-column type="index" align="center"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="200px" align="center">
          <template v-slot="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditRoleDialog(scope.row.id)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleById(scope.row.id)"></el-button>
            <!-- 分配权限按钮 -->
            <el-tooltip content="分配权限" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"
                        @click="showAssignPermissionsDialog(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="assignPermissionsDialogVisible"
      width="600px"
      @close="assignPermissionsDialogClosed">
      <!-- 对话框内容(树形控件) -->
      <el-tree
        :data="rightsList"
        show-checkbox
        node-key="id"
        default-expand-all
        :props="treeProps"
        :default-checked-keys="defaultKeys"
        ref="treeRef">
      </el-tree>
      <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="assignPermissionsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加角色的对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisible"
      width="600px"
      @close="addRoleDialogClosed">
      <!-- 对话框内容 -->
      <el-form @submit.native.prevent :model="addRoleForm" :rules="addRoleFormRules" ref="addRoleFormRef" label-width="134px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName" placeholder="请输入角色名称" clearable>
          </el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc" type="textarea" placeholder="请输入角色描述"
                    maxlength="40" resize="none" :autosize="{ minRows: 2, maxRows: 6 }">
          </el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveAddRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色的对话框 -->
    <el-dialog
      title="修改角色"
      :visible.sync="editRoleDialogVisible"
      width="600px"
      @close="editRoleDialogClosed">
      <!-- 对话框内容 -->
      <el-form @submit.native.prevent :model="editRoleForm" :rules="editRoleFormRules" ref="editRoleFormRef" label-width="134px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName" placeholder="请输入角色名称" clearable>
          </el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc" type="textarea" placeholder="请输入角色描述"
                    maxlength="40" resize="none" autosize>
          </el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveEditRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 保存角色列表数据
      rolesList: [],
      // 控制分配权限对话框的状态 
      assignPermissionsDialogVisible: false,
      // 保存权限列表数据 
      rightsList: [],
      // 树形控件配置选项 
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中的节点 
      defaultKeys: [],
      // 保存角色ID
      roleId: '',
      // 添加角色对话框的状态 
      addRoleDialogVisible: false,
      // 添加角色的表单
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色的表单验证 
      addRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ]
      },
      // 修改角色对话框的状态 
      editRoleDialogVisible: false,
      // 修改角色的表单 
      editRoleForm: {},
      // 修改角色的表单验证 
      editRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ]
      },
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取角色列表数据
    async getRolesList() {
      const {data: res} = await this.$http.get('roles')
      if(res.meta.status !== 200) {
        return this.$message.error({
          message: '获取角色列表失败!',
          duration: 1000
        })
      }
      this.rolesList = res.data
      // console.log(this.rolesList);
    },
    // 根据id删除对应角色权限
    async removeRightById(role, rightId, parentRight, grandParentRight) {
      // 弹框询问是否删除该权限
      const confirmRes = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // console.log(confirmRes);
      if(confirmRes !== 'confirm') {
        return this.$message({
          message: '已取消删除',
          duration: 1000
        })
      }
      // 点击确认删除
      const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if(res.meta.status !== 200) {
        return this.$message.error({
          message: '删除权限失败!',
          duration: 1000
        })
      }
      role.children = res.data
      // console.log(res.data);
      // console.log(role, rightId, parentRight);
      // 删除成功后判断同级权限是否*还*存在
      if(parentRight && parentRight.children && (parentRight.children.length !== 1)) return 
      // // 如果删除后同级权限不存在，则删除父级权限
      // // console.log(role.id, parentRight.id);
      const {data: parentRes} = await this.$http.delete(`roles/${role.id}/rights/${parentRight.id}`)
      if(!parentRes.data) {
        return 
      }
      role.children = parentRes.data
      // // console.log(parentRes);
      // console.log(grandParentRight);
      if(grandParentRight && grandParentRight.children && (grandParentRight.children.length !== 1)) {
        return 
      }
      const {data: grandParentRes} = await this.$http.delete(`roles/${role.id}/rights/${grandParentRight.id}`)
      // 更新权限
      if(grandParentRes.data) {
        return role.children = grandParentRes.data
      }
    },
    // 展示分配权限对话框
    async showAssignPermissionsDialog(role) {
      // 将角色ID保存到data中
      this.roleId = role.id
      // 展示对话框前获取权限列表数据
      const {data: res} = await this.$http.get('rights/tree')
      if(res.meta.status !== 200) {
        return this.$message.error({
          message: res.meta.msg,
          duration: 1000
        })
      }
      // 将获取到的数据保存到data
      this.rightsList = res.data
      // console.log(this.rightsList);
      // 获取三级节点的id
      this.getLeafKeys(role, this.defaultKeys)
      // 展示对话框
      this.assignPermissionsDialogVisible = true
    },
    // 利用递归获取相应角色下三级权限节点的id
    getLeafKeys(node, arr) {
      if(!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      });
    },
    // 关闭对话框清空选中节点
    assignPermissionsDialogClosed() {
      this.defaultKeys = []
    },
    // 点击确认分配权限
    async allotRights() {
      // 获取权限ID列表
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      // console.log(keys);
      // 发送网络请求
      const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, {rids: idStr})
      if(res.meta.status !==200) {
        return this.$message.error({
          message: '分配权限失败',
          duration: 1000
        })
      }
      this.$message.success({
        message: '分配权限成功',
        duration: 1000
      })
      // 分配成功后刷新角色列表，关闭对话框
      this.getRolesList()
      this.assignPermissionsDialogVisible = false
    },
    // 显示添加角色对话框
    addRole() {
      this.addRoleDialogVisible = true
    },
    // 确认添加新角色
    saveAddRole() {
      this.$refs.addRoleFormRef.validate(async valid => {
        if(!valid) return
        // console.log(valid);
        const {data: res} = await this.$http.post('roles', this.addRoleForm)
        if(res.meta.status !==201) {
          return this.$message.error({
            message: '添加角色失败!',
            duration: 1000
          })
        }
        this.$message.success({
          message: '添加角色成功!',
          duration: 1000
        })
        this.getRolesList()
        this.addRoleDialogVisible = false
      })
    },
    // 添加角色对话框关闭后重置表单
    addRoleDialogClosed() {
      this.$refs.addRoleFormRef.resetFields()
    },
    // 显示修改角色对话框
    async showEditRoleDialog(roleId) {
      // console.log(roleId);
      const {data: res} = await this.$http.get('roles/' + roleId)
      if(res.meta.status !== 200) {
        return this.$message.error({
          message: '获取角色信息失败!',
          duration: 1000
        })
      }
      // console.log(this.editRoleForm);
      this.editRoleDialogVisible = true
      /* 
        生成新的dom元素后再赋值，以免原属性被覆盖，造成resetFields()问题，
        修改信息采用clearValidate()则不需要
      */
      this.$nextTick(() => {
          this.editRoleForm = res.data
      })
      // this.editRoleForm = res.data
    },
    // 确认修改角色(预验证修改角色信息并提交)
    saveEditRole() {
      this.$refs.editRoleFormRef.validate(async valid => {
        if(!valid) return
        const {data: res} = await this.$http.put('roles/' + this.editRoleForm.roleId, {
          roleName: this.editRoleForm.roleName,
          roleDesc: this.editRoleForm.roleDesc
        })
        if(res.meta.status !== 200) {
          return this.$message.error({
            message: '修改角色信息失败!',
            duration: 1000
          })
        }
        // console.log(res);
        this.editRoleDialogVisible = false
        this.getRolesList()
        this.$message.success({
          message: '修改角色信息成功!',
          duration: 1000
        })
      })     
    },
    // 监听修改角色对话框关闭
    editRoleDialogClosed() {
      // this.$refs.editRoleFormRef.resetFields()
      // 修改信息使用去除校验的方法体验更佳
      this.$refs.editRoleFormRef.clearValidate()
    },
    // 根据ID删除角色
    removeRoleById(roleId) {
      // console.log(roleId);
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const {data: res} = await this.$http.delete('roles/' + roleId)
        if(res.meta.status !== 200) {
          return this.$message.error({
            message: '删除角色失败!',
            duration: 1000
          })
        }
        this.$message.success({
          message: '删除角色成功!',
          duration: 1000
        })
        this.getRolesList()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除',
          duration: 1000
        });          
      });
    }
  }
}
</script>

<style lang="less" scoped>
.addrole {
  padding-left: 15px;
  padding-right: 13px;
  font-size: 14px;
  letter-spacing: .8px;
}
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #EBEEF5;
}
.bdbottom {
  border-bottom: 1px solid #EBEEF5;
}
.vertical-center {
  display: flex;
  align-items: center;
}
.el-input {
  width: 350px;
}
.el-textarea {
  width: 350px;
}
</style>