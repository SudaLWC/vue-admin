<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加分类按钮 -->
      <el-row>
        <el-col>
          <el-button class="addCate" type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 商品分类表格 -->
      <tree-table class="tree-table" :data="cateList" :columns="columns" show-index index-text=""
                  :show-row-hover="false" border :expand-type="false" :selection-type="false">
        <!-- 是否有效 -->
        <template slot="available" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen;"></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>
        <!-- 排序 -->
        <template slot="sort" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="operate" slot-scope="scope">
          <el-button icon="el-icon-edit" type="primary" size="mini" @click="showEditCate(scope.row.cat_id)">编辑</el-button>
          <el-button icon="el-icon-delete" type="danger" size="mini" @click="removeCateById(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="cateQueryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="cateQueryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    <!--  -->
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="600px"
      @close="addCateDialogclosed">
      <!-- 对话框内容 -->
      <el-form @submit.native.prevent :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="134px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name" placeholder="请输入分类名称" clearable>
          </el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader            
            :options="parentCateList"
            :props="{ expandTrigger: 'hover' ,value: 'cat_id',label: 'cat_name',children: 'children', checkStrictly: 'true'}"
            v-model="chosenKeys"
            @change="parentCateChange" clearable ref="cascader"></el-cascader>
        </el-form-item>
      </el-form>
      <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveAddCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类的对话框 -->
    <el-dialog
      title="编辑分类"
      :visible.sync="editCateDialogVisible"
      width="600px"
      @close="editCateDialogclosed">
      <!-- 对话框内容 -->
      <el-form @submit.native.prevent :model="editCateForm" :rules="editCateFormRules" ref="editCateFormRef" label-width="134px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name" placeholder="请输入分类名称" clearable>
          </el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveEditCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 获取商品分类列表的参数 
      cateQueryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 保存商品分类数据列表
      cateList: [],
      // 商品分类数据总数（用于实现分页）
      total: 0,
      // tree-table列定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'available'
        },
        {
          label: '排序',
          type: 'template',
          template: 'sort'
        },
        {
          label: '操作',
          type: 'template',
          template: 'operate',
          width: 200,
          align: 'center'
        }
      ],
      // 显示添加分类对话框的状态 
      addCateDialogVisible: false,
      // 添加分类表单数据 
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      // 添加分类表单验证 
      addCateFormRules: {
        cat_name:[
          { required: true, message: '请输入分类名称', trigger: 'blur'}
        ]
      },
      // 父级分类数据
      parentCateList: [],
      // 已选父级分类ID 
      chosenKeys:[],
      // 显示编辑分类对话框的状态 
      editCateDialogVisible: false,
      // 保存请求过来的编辑分类表单数据
      editCateForm: {},
      // 编辑分类表单验证 
      editCateFormRules: {
        cat_name:[
          { required: true, message: '请输入分类名称', trigger: 'blur'}
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据列表
    async getCateList() {
      const {data: res} = await this.$http.get('categories', {params: this.cateQueryInfo})
      if(res.meta.status !== 200) {
        return this.$message.error({
          message: '获取商品分类数据失败!',
          duration: 1500
        })
      }
      // console.log(res.data);
      this.cateList = res.data.result
      this.total = res.data.total
    },
    addCate() {
      console.log('添加分类');
    },
    // 监听每页条数改变
    handleSizeChange(newSize) {
      this.cateQueryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听当前页码改变
    handleCurrentChange(newPage) {
      this.cateQueryInfo.pagenum = newPage
      this.getCateList()
    },
    // 展示添加分类对话框
    showAddCateDialog() {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类表单
    async getParentCateList() {
      const {data: res} = await this.$http.get('categories',{params: {type: 2}})
      // console.log(res);
      if(res.meta.status !== 200) {
        return  this.$message.error({
          message: '获取父级分类失败!',
          duration: 1000
        })
      }
      this.parentCateList = res.data
    },
    // 监听选择父级分类的变化
    parentCateChange() {
      // console.log(this.chosenKeys);
      if(this.chosenKeys.length) {
        this.addCateForm.cat_pid = this.chosenKeys[this.chosenKeys.length - 1]
        this.addCateForm.cat_level = this.chosenKeys.length
        // console.log(this.addCateForm.cat_pid, this.addCateForm.cat_level);
        // 选中分类后关闭级联选择下拉框
        return  this.$refs.cascader.dropDownVisible = false      
      }
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
      // console.log(this.addCateForm.cat_pid, this.addCateForm.cat_level);
    },
    // 点击确认添加新的商品分类
    saveAddCate() {
      // 预验证并提交表单
      this.$refs.addCateFormRef.validate(async valid => {
        // console.log(valid);
        if(!valid) return
        const {data: res} = await this.$http.post('categories',this.addCateForm)
        if(res.meta.status !== 201) {
          return this.$message.error({
            message: '添加分类失败!',
            duration: 1000
          })
        }
        this.$message.success({
          message: '添加分类成功!',
          duration: 1000
        })
        this.getCateList()
        // 关闭对话框
        this.addCateDialogVisible = false
      })
    },
    // 监听添加分类对话框的关闭
    addCateDialogclosed() {
      this.$refs.addCateFormRef.resetFields()
      this.chosenKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 展示编辑分类对话框
    async showEditCate(id) {
      // console.log(id);
      const {data: res} = await this.$http.get('categories/' + id)
      // console.log(res);
      if(res.meta.status !== 200) {
        return this.$message.error({
          message: '获取分类失败!',
          duration: 1000
        })
      }
      this.editCateForm = res.data
      // console.log(this.editCateForm);
      this.editCateDialogVisible = true
    },
    // 监听编辑分类对话框的关闭
    editCateDialogclosed() {
      this.$refs.editCateFormRef.clearValidate()
    },
    // 确认编辑分类
    saveEditCate() {
      this.$refs.editCateFormRef.validate(async valid => {
        if(!valid) return
        const{data: res} = await this.$http.put('categories/' + this.editCateForm.cat_id, {
          cat_name: this.editCateForm.cat_name
        })
        if(res.meta.status !== 200) {
          return this.$message.error({
            message: '更新分类失败!',
            duration: 1000
          })
        }
        this.editCateDialogVisible = false 
        this.getCateList()
        this.$message.success({
          message: '更新分类成功!',
          duration: 1000
        })       
      })
    },
    // 根据ID删除分类
    removeCateById(id) {
      // console.log(id);
      this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const {data: res} = await this.$http.delete('categories/' + id)
        if(res.meta.status !== 200) {
          return this.$message.error({
            message: '删除分类失败!',
            duration: 1000
          })
        }
        this.$message.success({
          message: '删除分类成功!',
          duration: 1000
        })
        this.getCateList()
      }).catch(() => {
        this.$message({
          message: '已取消删除',
          duration: 1000
        })
      })
    }
  }
}
</script>

<style lang="less" scoped>
.addCate {
  padding-left: 15px;
  padding-right: 13px;
  font-size: 14px;
  letter-spacing: .8px;  
}
.tree-table {
  margin-top: 20px;
  font-size: 14px;
}
.el-input {
  width: 350px;
}
.el-cascader {
  width: 350px;
}
</style>