<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与查询区域 -->
      <el-row :gutter="40">
        <el-col :span="9">
          <el-input placeholder="请输入商品名称" v-model="queryInfo.query" clearable
                    @clear="getGoodsList" @keyup.enter.native="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList">            
            </el-button>
          </el-input>                    
        </el-col>
        <el-col :span="4">
          <el-button class="addGoods" type="primary" @click="toAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 商品列表数据展示 -->
      <el-table :data="goodsList" stripe border>
        <el-table-column type="index" align="center"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="价格(元)" prop="goods_price" width="100px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="100px"></el-table-column>
        <el-table-column label="创建时间" width="180px">
          <template v-slot="scope">
            {{scope.row.add_time | timeFormater}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150px" align="center">
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditGoods(scope.row.goods_id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeGoodsById(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>      

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    <!--  -->
    </el-card>

    <!-- 修改商品对话框 -->
    <el-dialog
      title="修改商品信息"
      :visible.sync="editGoodsDialogVisible"
      width="600px"
      @close="editGoodsDialogclosed">
      <!-- 对话框内容 -->
      <el-form :model="editGoodsForm" :rules="editGoodsFormRules" ref="editGoodsFormRef" label-width="134px">
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="editGoodsForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="editGoodsForm.goods_price" type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="editGoodsForm.goods_weight" type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品数量" prop="goods_number">
          <el-input v-model="editGoodsForm.goods_number" type="number"></el-input>
        </el-form-item>
      </el-form>
      <div style="display: flex;justify-content: spacearound" v-if="editGoodsForm.pics.length">
        <span style="width: 122px; text-align: right; padding-right: 12px;">商品图片</span>
        <el-carousel height="150px" style="width: 350px;" indicator-position="none">
          <el-carousel-item v-for="item in editGoodsForm.pics" :key="item.pics_id" style="display: flex; justity-content: center;">
            <img style="height: 150px; margin: auto;" :src="item.pics_big_url.replace('http://127.0.0.1', 'https://lianghj.top')">
          </el-carousel-item>
        </el-carousel>
      </div>
      <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editGoodsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveEditGoods">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品列表查询参数 
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      // 保存商品总条数,用于渲染分页 
      total: 0,
      // 控制添加商品对话框的显示状态 
      addGoodsDialogVisible: false,
      // 保存商品列表数据
      goodsList: [],
      // 修改商品信息对话框显示状态 
      editGoodsDialogVisible: false,
      // 修改商品表单 
      editGoodsForm: {
        pics: []
      },
      // 修改商品表单验证 
      editGoodsFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    // 获取商品列表
    async getGoodsList() {
      const {data: res} = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if(res.meta.status !==200) {
        return this.$message.error({
          message: '获取商品列表失败!',
          duration: 1500
        })
      }
      // console.log(res.data);
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    // 监听pagesize变化
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 监听currentpage变化
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    // 根据ID删除商品
    removeGoodsById(id) {
      this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const {data: res} = await this.$http.delete(`goods/${id}`)
        if(res.meta.status !== 200) {
          return this.$message.error({
            message: '删除商品失败!',
            duration: 1500
          })
        }
        this.$message.success({
          message: '删除商品成功!',
          duration: 1500
        })
        this.getGoodsList()
      }).catch(() => {
        this.$message({
          message: '已取消删除',
          duration: 1500
        })
      })
    },
    // 跳转至添加商品页
    toAddPage() {
      this.$confirm('即将跳转至添加商品页, 是否继续?', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        center: true,
        showClose: false,
        modal: false,
        cancelButtonClass: 'cancelBtn',
        confirmButtonClass: 'confirmBtn',
        customClass: 'customClass'
      }).then(() => {
        this.$router.push('/goods/add')
      }).catch(err => err)   
    },
    // 展示修改商品对话框
    async showEditGoods(id) {
      // 查询商品信息
      const {data: res} = await this.$http.get('goods/' + id)
      // console.log(res);
      if(res.meta.status !== 200) {
        return this.$message.error({
          message: '查询商品信息失败!',
          duration: 1500
        })
      }
      this.editGoodsForm = res.data
      this.editGoodsDialogVisible = true
      console.log(this.editGoodsForm);
      // this.$message({
      //   message: '修改功能开发中',
      //   duration: 1500
      // })
    },
    // 监听修改商品对话框关闭
    editGoodsDialogclosed() {
      // 清除表单验证
      this.$refs.editGoodsFormRef.clearValidate()
    },
    // 保存修改商品信息
    saveEditGoods() {
      // 预验证表单
      this.$refs.editGoodsFormRef.validate(async valid => {
        if(!valid) return
        // 发起请求
        const {data: res} = await this.$http.put('goods/' + this.editGoodsForm.goods_id, {
          goods_name: this.editGoodsForm.goods_name,
          goods_price: this.editGoodsForm.goods_price,
          goods_number: this.editGoodsForm.goods_number,
          goods_weight: this.editGoodsForm.goods_weight,
          goods_cat: this.editGoodsForm.goods_cat
        })
        // console.log(res);
        if(res.meta.status !== 200) {
          return this.$message.error({
            message: '修改商品信息失败!',
            duration: 1500
          })
        }
        this.$message.success({
          message: '修改商品信息成功!',
          duration: 1500
        })
        this.editGoodsDialogVisible = false
        this.getGoodsList()
      })
    }
  }
}
</script>

<style lang="less" scoped>
.addGoods {
  padding-left: 15px;
  padding-right: 13px;
  font-size: 14px;
  letter-spacing: .8px;
}
.el-input {
  width: 350px;
}
</style>