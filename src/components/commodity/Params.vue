<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 头部警告 -->
      <el-alert
        title="注意: 只允许为第三级分类设置相关参数!"
        type="warning"
        show-icon
        :closable="false">
      </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="good-choice">
        <el-col>
          <span>选择商品分类:</span>
          <el-cascader            
            :options="cateList"
            :props="cateProps"
            v-model="selectedKeys"
            @change="cateChange" clearable size="small"></el-cascader>
        </el-col>
      </el-row>
      <!-- 标签页 -->
      <el-row class="tabnav">
        <el-col>
          <el-tabs v-model="activeName" @tab-click="handleClick">           
            <!-- 动态参数页内容 -->
            <template>
              <el-tab-pane label="动态参数" name="many">
                <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addAttrDialogVisible = true">
                  添加参数
                </el-button>
                <!-- 动态参数表格 -->
                <el-table :data="manyData" border stripe v-if="activeName === 'many'">
                  <!-- 展开列 -->
                  <el-table-column type="expand">
                    <template v-slot="scope">
                      <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index"
                              closable :disable-transitions="false" @close="removeValTag(scope.row, index)">
                        {{item}}  
                      </el-tag>
                      <el-input
                        class="input-new-tag"
                        v-if="scope.row.inputVisible"
                        v-model="scope.row.inputValue"
                        ref="saveTagInput"
                        size="small"
                        @keyup.enter.native="handleInputConfirm(scope.row)"
                        @blur="handleInputConfirm(scope.row)"
                      >
                      </el-input>
                      <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                    </template>
                  </el-table-column>

                  <el-table-column type="index" align="center"></el-table-column>
                  <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                  <el-table-column label="操作">
                    <template v-slot="scope">
                      <el-button type="primary" @click="showEditAttrDialog(scope.row.attr_id)" size="mini" icon="el-icon-edit">
                        修改
                      </el-button>
                      <el-button type="danger " @click="removeAttrById(scope.row.attr_id)" size="mini" icon="el-icon-delete">
                        删除
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
            </template>
            <!-- 静态属性页内容 -->
            <template>
              <el-tab-pane label="静态属性" name="only">
                <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addAttrDialogVisible = true">
                  添加属性
                </el-button>
                <!-- 静态属性表格 -->
                <el-table :data="onlyData" border stripe v-if="activeName === 'only'">
                  <!-- 展开列 -->
                  <el-table-column type="expand">
                    <template v-slot="scope">
                      <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index"
                              closable :disable-transitions="false" @close="removeValTag(scope.row, index)">
                        {{item}}
                      </el-tag>
                      <el-input
                        class="input-new-tag"
                        v-if="scope.row.inputVisible"
                        v-model="scope.row.inputValue"
                        ref="saveTagInput"
                        size="small"
                        @keyup.enter.native="handleInputConfirm(scope.row)"
                        @blur="handleInputConfirm(scope.row)"
                      >
                      </el-input>
                      <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                    </template>
                  </el-table-column>

                  <el-table-column type="index" align="center"></el-table-column>
                  <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                  <el-table-column label="操作">
                    <template v-slot="scope">
                      <el-button type="primary" @click="showEditAttrDialog(scope.row.attr_id)" size="mini" icon="el-icon-edit">
                        修改
                      </el-button>
                      <el-button type="danger " @click="removeAttrById(scope.row.attr_id)" size="mini" icon="el-icon-delete">
                        删除
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
            </template>
          </el-tabs>
        </el-col>
      </el-row>
    <!--  -->
    </el-card>

    <!-- 添加动态参数\静态属性对话框 -->
    <el-dialog
      :title="'添加' + titleContent"
      :visible.sync="addAttrDialogVisible"
      width="600px"
      @close="addAttrDialogclosed">
      <!-- 对话框内容 -->
      <el-form @submit.native.prevent :model="addAttrForm" :rules="addAttrFormRules" ref="addAttrFormRef" label-width="134px">
        <el-form-item label="参数名称" prop="attr_name">
          <el-input v-model="addAttrForm.attr_name" placeholder="请输入参数名称" clearable>
          </el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addAttrDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveAddAttr">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改动态参数\静态属性对话框 -->
    <el-dialog
      :title="'修改' + titleContent"
      :visible.sync="editAttrDialogVisible"
      width="600px"
      @close="editAttrDialogclosed">
      <!-- 对话框内容 -->
      <el-form @submit.native.prevent :model="editAttrForm" :rules="editAttrFormRules" ref="editAttrFormRef" label-width="134px">
        <el-form-item label="参数名称" prop="attr_name">
          <el-input v-model="editAttrForm.attr_name" placeholder="请输入参数名称" clearable>
          </el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editAttrDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveEditAttr">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表 
      cateList: [],
      // 级联选择器配置
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的商品分类 
      selectedKeys: [],
      // 当前活跃标签页
      activeName: 'many',
      // 动态参数数据 
      manyData: [],
      // 静态属性数据 
      onlyData: [],
      // 控制添加参数/属性对话框的显示
      addAttrDialogVisible: false,
      // 添加参数表单数据 
      addAttrForm: {
        attr_name: ''
      },
      // 验证添加参数表单规则 
      addAttrFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur'}
        ] 
      },
      // 控制修改参数/属性对话框的显示
      editAttrDialogVisible: false,
      // 保存修改参数表单数据 
      editAttrForm: {},
      // 验证修改参数表单规则 
      editAttrFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur'}
        ] 
      }    
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类列表
    async getCateList() {
      const {data: res} = await this.$http.get('categories')
      if(res.meta.status !== 200) {
        return this.$message.error({
          message: '获取商品分类列表失败!',
          duration: 1500
        })
      }
      // console.log(res);
      this.cateList = res.data
    },
    // 监听商品分类的选择
    cateChange() {
      if(this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyData = []
        this.onlyData = []
        return
      }
      // console.log(this.selectedKeys);
      this.getTableData()
    },
    // 点击标签页
    handleClick() {
      if(this.selectedKeys.length !== 3) return
      this.getTableData()
    },
    // 发起请求获取(动态参数/静态属性)表格数据
    async getTableData() {
      // 将表格数据重新赋值为空数组,解决数据更新引起的el-table重绘时的数据闪烁问题
      this.manyData = []
      this.onlyData = []
      const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`,{
        params:{sel: this.activeName}
      })
      if(res.meta.status !== 200) {
        return this.$message.error({
          message: '获取表格数据失败!',
          duration: 1000
        })
      }
      // 将vals从字符串转换为数组
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        // 给每个参数设置单独的inputVisible,inputValue;
        item.inputVisible = false
        item.inputValue = ''
      });
      // console.log(res.data);
      if(this.activeName === 'many') {
        this.manyData = res.data
        return
      } else {
        this.onlyData = res.data
        return
      }
    },
    // 监听添加(动态参数/静态属性)对话框关闭
    addAttrDialogclosed() {
      // 重置表单
      this.$refs.addAttrFormRef.resetFields()
    },
    // 确认添加(动态参数/静态属性)
    saveAddAttr() {
      // 预验证
      this.$refs.addAttrFormRef.validate(async valid => {
        if(!valid) return
        // 成功发送请求
        const {data: res} = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addAttrForm.attr_name,
          attr_sel: this.activeName
        })
        if(res.meta.status !== 201) {
          return this.$message.error({
            message: '添加参数失败!',
            duration: 1000
          })
        }
        this.addAttrDialogVisible = false
        this.$message.success({
          message: '添加参数成功!',
          duration: 1000
        })
        this.getTableData()
      })
    },
    // 展示修改(动态参数/静态属性)对话框
    async showEditAttrDialog(id) {
      // 根据ID查询(动态参数/静态属性)
      const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes/` + id, {
        params: {attr_sel: this.activeName}
      })
      if(res.meta.status !== 200) {
        return this.$message.error({
          message: '获取' + this.titleContent + '信息失败!',
          duration: 1000
        })
      }
      this.editAttrForm = res.data
      // console.log(this.editAttrForm);
      this.editAttrDialogVisible = true
    },
    // 确认修改(动态参数/静态属性)
    saveEditAttr() {
      // 预验证
      this.$refs.editAttrFormRef.validate(async valid => {
        if(!valid) return
        // 通过后发起请求
        const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editAttrForm.attr_id}`, {
          attr_name: this.editAttrForm.attr_name,
          attr_sel: this.activeName,
          attr_vals: this.editAttrForm.attr_vals
        })
        if(res.meta.status !== 200) {
          return this.$message.error({
            message: '修改' + this.titleContent + '失败!',
            duration: 1500
          })
        }
        this.editAttrDialogVisible = false
        this.$message.success({
          message: '修改' + this.titleContent + '成功!',
          duration: 1500
        })
        this.getTableData()
      })
    },
    // 监听修改(动态参数/静态属性)对话框关闭
    editAttrDialogclosed() {
      // 不需要重置表单
      // this.$refs.editAttrFormRef.resetFields()
      // 去除校验
      this.$refs.editAttrFormRef.clearValidate()
    },
    // 根据ID删除(动态参数/静态属性)
    removeAttrById(id) {
      // 弹框确认
      this.$confirm(`'此操作将永久删除该'${this.titleContent}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const {data: res} = await this.$http.delete(`categories/${this.cateId}/attributes/` + id)
        if(res.meta.status !== 200) {
          return this.$message.error({
            message: '删除' + this.titleContent + '失败!',
            duration: 1500
          })
        }
        this.$message.success({
          message: '删除' + this.titleContent + '成功!',
          duration: 1500
        })
        this.getTableData()
      }).catch(() => {
        this.$message({
          message: '已取消删除',
          duration: 1500
        })
      })
     
    },
    // 展示tag输入框
    showInput(row) {
      row.inputVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      })
    },
    // 监听input框失去焦点和敲击enter键
    handleInputConfirm(row) {
      if (!row.inputValue.trim()) {
        // console.log(row.inputValue.trim());
        row.inputVisible = false;
        row.inputValue = '';
        return
      }
      // console.log(row.inputValue.trim());
      row.attr_vals.push(row.inputValue.trim())
      row.inputVisible = false;
      row.inputValue = '';
      // console.log(row.attr_vals);
      // 保存修改参数项
      this.saveAttrVal(row)
    },
    // 关闭标签删除参数项
    removeValTag(row, index) {
      // console.log(row, index);
      row.attr_vals.splice(index, 1)
      this.saveAttrVal(row)
    },
    // 发送请求,提交参数项attr_vals
    async saveAttrVal(row) {
      const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: this.activeName,
        attr_vals: row.attr_vals.join(',')
      })
      if(res.meta.status !== 200) {
        return this.$message.error({
          message: '更新参数项失败!',
          duration: 1500
        })
      }
      this.$message.success({
        message: '更新参数项成功!',
        duration: 1500
      })
    }
  },
  computed: {
    // 按钮是否禁用
    isBtnDisabled() {
      if(this.selectedKeys.length !== 3) {
        return true
      }
      return false
    },
    // 保存第三级分类ID
    cateId() {
      if(this.selectedKeys.length !== 3) {
        return null
      }
      return this.selectedKeys[2]
    },
    // 添加对话框的标题转换（参数/属性）
    titleContent() {
      if(this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.good-choice {
  margin-top: 20px;
  font-size: 14px;
  .el-cascader {
    margin-left: 20px;
  }
}
.tabnav {
  margin-top: 20px;
}
.el-input {
  width: 350px;
}
.el-tag {
  margin: 5px 15px 5px 0;
}
.input-new-tag {
  width: 89px;
}
.v-cloak {
  display: none;
}
</style>