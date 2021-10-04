<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>订单管理</el-breadcrumb-item>
    <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图  -->
    <el-card>
      <!-- 搜索区域  -->
      <el-row>
        <el-col :span="9">
          <el-input placeholder="请输入订单编号" v-model="queryInfo.query" clearable
                    @clear="getOrdersList" @keyup.enter.native="getOrdersList">
            <el-button slot="append" icon="el-icon-search" @click="getOrdersList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="ordersList" border stripe>
        <el-table-column type="index" align="center"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price" width="80px" align="center"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status" width="90px" align="center">
          <template v-slot="scope">
            <el-tag v-if="scope.row.pay_status === '1'" type="success" >已付款</el-tag>
            <el-tag v-else type="danger" >未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send" width="80px" align="center"></el-table-column>
        <el-table-column label="下单时间" width="180px" prop="create_time">
          <template v-slot="scope">
            {{scope.row.create_time | timeFormater}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150px" align="center">
          <template v-slot="">
            <el-button size="mini" icon="el-icon-edit" type="primary" @click="editAdress"></el-button>
            <el-button size="mini" icon="el-icon-location" type="success" @click="showProgressBox"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>      
    <!--  -->
    </el-card>

    <!-- 修改地址对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="editAdressDialogVisible"
      width="600px"
      @close="editAdressDialogclosed">
      <!-- 对话框内容 -->
      <el-form :model="editAdressForm" :rules="editAdressFormRules" ref="editAdressFormRef" label-width="134px">
        <el-form-item label="省市区/县" prop="province">
          <el-cascader
            v-model="editAdressForm.province"
            :options="cityData"
            :props="{ expandTrigger: 'hover' }">
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="adress">
          <el-input v-model="editAdressForm.adress"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editAdressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveEditAdress">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 物流进度对话框 -->
    <el-dialog
      title="物流进度"
      :visible.sync="progressDialogVisible"
      width="600px">
      <!-- 物流进度框内容 -->
      <el-timeline :reverse="false">
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time">
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata'

export default {
  data() {
    return {
      // 订单请求参数信息 
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 订单数据总条数 
      total: 0,
      // 订单列表数据 
      ordersList: [],
      // 修改地址对话框显示状态 
      editAdressDialogVisible: false,
      // 修改地址表单 
      editAdressForm: {
        adress: '',
        province: ''
      },
      // 修改地址表单验证规则 
      editAdressFormRules: {
        province: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' }
        ],
        adress: [
          { required: true, message: '请填写订单详细地址', trigger: 'blur' }
        ]
      },
      // 引入省市区县数据列表 
      cityData,
      // 物流进度信息 
      progressInfo: [],
      // 物流进度框显示状态 
      progressDialogVisible: false
    }
  },
  created() {
    this.getOrdersList()
  },
  methods: {
    // 获取订单列表
    async getOrdersList() {
      const {data: res} = await this.$http.get('orders', { params: this.queryInfo })
      // console.log(res);
      if(res.meta.status !== 200) {
        return this.$message.error({
          message: '获取订单列表失败!',
          duration: 1500
        })
      }
      this.total = res.data.total
      this.ordersList = res.data.goods
      this.$message.success({
        message: '获取订单列表成功',
        duration: 1500
      })
    },
    // 监听pagesize变化
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrdersList()
    },
    // 监听currentpage变化
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrdersList()
    },
    // 修改地址
    editAdress() {
      // 展示修改地址对话框
      this.editAdressDialogVisible = true
    },
    // 监听修改地址对话框关闭
    editAdressDialogclosed() {
      // 重置表单
      this.$refs.editAdressFormRef.resetFields()
    },
    // 保存订单地址信息
    saveEditAdress() {
      this.$refs.editAdressFormRef.validate(valid => {
        if(!valid) return
        this.editAdressDialogVisible = false
      })
    },
    // 显示物流进度对话框
    async showProgressBox() {
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: '获取物流进度失败!',
          duration: 1500
        })
      }
      this.progressInfo = res.data
      this.progressDialogVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
.el-input, .el-cascader {
  width: 350px;
}
</style>