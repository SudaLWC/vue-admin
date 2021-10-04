<template>
  <div>
    <!-- 头部  -->
    <el-row>
      <el-col :span="23">
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>
      </el-col>
      <el-col :span="1">
        <!-- 返回商品列表按钮 -->
        <div class="back" @click="backToGoods">
          <i class="el-icon-arrow-left"></i> <span>返回</span>
        </div>
      </el-col>
    </el-row>

    <!-- 卡片视图  -->
    <el-card>
      <!-- 头部警告 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false">
      </el-alert>
      <!-- 步骤条 -->
      <el-steps :active="activeIndex - 0" align-center finish-status="success">
        <el-step title="基本信息" ></el-step>
        <el-step title="商品参数" ></el-step>
        <el-step title="商品属性" ></el-step>
        <el-step title="商品图片" ></el-step>
        <el-step title="商品内容" ></el-step>
        <el-step title="完成" ></el-step>
      </el-steps>
      <!-- el-form必须套在tabs外层 -->
      <el-form :model="addGoodsForm" :rules="addGoodsFormRules" ref="addGoodsFormRef" label-position="top">
        <!-- 左侧标签页 -->
        <el-tabs tab-position="left" v-model="activeIndex" @tab-click="handleTabClick" :before-leave="beforeTabLeave">
          <!-- 基本信息表单 -->
          <el-tab-pane label="基本信息" name="0" class="goodsInfo">
            <!-- 商品分类级联选择器 -->
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader            
                :options="cateList"
                :props="cateProps"
                v-model="addGoodsForm.goods_cat"
                @change="handleCateChange" clearable></el-cascader>
            </el-form-item>
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodsForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addGoodsForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addGoodsForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addGoodsForm.goods_number" type="number"></el-input>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品参数页渲染 -->
          <el-tab-pane label="商品参数" name="1" class="goodsParms">
            <el-form-item :label="item.attr_name" v-for="item in manyDataList" :key="item.attr_id" size="medium">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border :label="box" v-for="(box, i) in item.attr_vals" :key="i"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品属性页渲染 -->
          <el-tab-pane label="商品属性" name="2" class="goodsProps">
            <el-form-item :label="item.attr_name" v-for="item in onlyDataList" :key="item.attr_id" size="medium">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品图片页渲染 -->
          <el-tab-pane label="商品图片" name="3" class="goodsPics">
            <el-scrollbar :native="false" tag="section" wrap-class="wrap-class" ref="picScrollRef">
              <div style="position: relative;height: 320px;">
                <el-empty description="暂无图片" v-if="!picPreviewList.length" style="height: 300px;">
                  <el-button size="mini" type="primary" @click="uploadPics">点击上传</el-button>
                </el-empty>
                <!-- action表示图片要上传到的后台API地址 -->
                <el-upload
                  class="pic-uploader upload" 
                  :action="uploadURL"
                  list-type="picture" multiple
                  :on-success="handleSuccess" :on-preview="handlePreview"
                  :headers="headersObj" :on-remove="handleRemove" ref="uploadRef" v-show="picPreviewList.length">
                  <i class="el-icon-plus pic-uploader-icon"></i>
                </el-upload>
              </div>
            </el-scrollbar>
          </el-tab-pane>
          <!-- 商品内容页渲染 -->
          <el-tab-pane label="商品内容" name="4" class="goodsContent">
            <!-- 富文本编辑器,绑定添加表单的商品介绍 -->
            <quill-editor v-model="addGoodsForm.goods_introduce"></quill-editor>
            <!-- 添加商品按钮 -->
            <el-button type="primary" size="mini" @click="addGoods" class="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

     <!-- 图片预览对话框   -->
     <!-- <el-dialog :visible.sync="picDialogVisible" class="picDialog" top="25vh" width="30%" :show-close="false">  -->
      <!-- 预览所有图片  -->
      <el-image :src="picPreview" :preview-src-list="picPreviewList" ref="imgRef" v-show="false"></el-image>
    <!-- </el-dialog> -->
  </div>
</template>
 
<script>
import _ from 'lodash'

export default {
  data() {
    return {
      // 步骤条当前index 
      activeIndex: '0',
      // 添加商品表单 
      addGoodsForm: {
        goods_cat: [],
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      // 添加商品表单验证 
      addGoodsFormRules: {
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ],
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
      },
      // 保存商品分类列表 
      cateList: [],
      // 级联选择器配置 
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的商品分类 =>保存到addGoodsForm.goods_cat中
      // selectedKeys:[]
      // 保存商品参数数据列表 
      manyDataList: [],
      // 保存商品属性数据列表 
      onlyDataList: [],
      // 图片上传的请求路径 
      uploadURL: 'https://lianghj.top:8888/api/private/v1/upload',
      // 请求头对象
      headersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片预览对话框显示状态 
      // picDialogVisible: false,
      // 图片预览路径 
      picPreview: '',
      // 预览图片路径数组 
      picPreviewList: []
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 返回商品列表
    backToGoods() {
      this.$router.push('/goods')
    },
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
    // 监听商品分类选择
    handleCateChange() {
      if(this.addGoodsForm.goods_cat.length !== 3) {
        this.addGoodsForm.goods_cat = []
        return
      }
    },
    // 离开标签页前的回调
    beforeTabLeave(activeName,oldActiveName) {
      // console.log(activeName,oldActiveName);
      if(oldActiveName === '0' && this.addGoodsForm.goods_cat.length !== 3) {
        this.$message.error({
          message: '请先选择商品分类!',
          duration: 1500
        })
        return false
      }
    },
    // 监听标签页点击
    async handleTabClick() {
      // 点击商品参数标签,展示动态参数面板
      if(this.activeIndex === '1') {
        // 发起数据请求获取动态参数
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {sel: 'many'}
        })
        if(res.meta.status !== 200) {
          return this.$message.error({
            message: '获取商品参数数据失败!',
            duration: 1500
          })
        }
        // 将attr_vals从字符串转换为数组
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        // console.log(item.attr_vals);
        })
        this.manyDataList = res.data
        console.log(this.manyDataList);
      }
      // 点击商品属性标签,展示静态属性面板
      if(this.activeIndex === '2') {
        // 发起数据请求获取静态属性
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {sel: 'only'}
        })
        if(res.meta.status !== 200) {
          return this.$message.error({
            message: '获取商品属性数据失败!',
            duration: 1500
          })
        }
        this.onlyDataList = res.data
        console.log(this.onlyDataList);
      }
    },
    // 图片预览
    handlePreview(file) {
      // console.log(file);
      // 添加图片显示路径
      this.picPreview = file.response.data.url.replace('http://127.0.0.1', 'https://lianghj.top')
      // 显示图片预览对话框
      // this.picDialogVisible = true
      // console.log(this.picPreviewList);
      this.$nextTick(() => {
        // 通过$refs获取el-image预览大图的开关,将showViewer状态设置为true
        this.$refs.imgRef.showViewer = true
      })
    },
    // 移除图片
    handleRemove(file) {
      // 获取移除图片的对应临时路径
      const filePath = file.response.data.tmp_path
      // 找到addGoodsForm.pics中存储的索引值,使用数组findIndex()方法
      const i = this.addGoodsForm.pics.findIndex(picObj => picObj.pic === filePath)
      // 删除数组中对应的路径对象
      this.addGoodsForm.pics.splice(i, 1)
      // console.log(file, this.addGoodsForm);
      // .....
      const fileUrl = file.response.data.url.replace('http://127.0.0.1', 'https://lianghj.top')
      const urlI = this.picPreviewList.findIndex(url => url === fileUrl)
      this.picPreviewList.splice(urlI, 1)
      // console.log(this.picPreviewList);
      // 更新滚动条
      setTimeout(() => {
        this.$refs.picScrollRef.update()
      },1500)
    },
    // 上传图片成功后的回调
    handleSuccess(response) {
      // console.log(response);
      // 拿到临时路径拼接成obj
      const picObj = {pic: response.data.tmp_path}
      // push到添加商品表单
      this.addGoodsForm.pics.push(picObj)
      // console.log(this.addGoodsForm.pics);

      this.picPreviewList.push(response.data.url.replace('http://127.0.0.1', 'https://lianghj.top'))
      // console.log(this.picPreviewList);

      // 更新滚动条
      this.$nextTick(() => {
        this.$refs.picScrollRef.update()
      })
    },
    // 点击按钮上传图片
    uploadPics() {
      this.$refs['uploadRef'].$refs['upload-inner'].handleClick()
    },
    // 点击添加商品按钮
    addGoods() {
      // 进行表单预验证
      this.$refs.addGoodsFormRef.validate(async valid => {
        if(!valid) {
          return this.$message.error({
            message: '请填写完整必要信息!',
            duration: 1500
          })
        }
        // console.log(this.addGoodsForm);
        // 处理goods_cat,由于在 级联选择器 做双向绑定的原因，需要使用第三方库lodash做深拷贝再处理
        const form = _.cloneDeep(this.addGoodsForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理attrs：many, only
        // 动态参数的vals是数组需转换为字符串
        this.manyDataList.forEach(item => {
          const obj = { attr_id: item.attr_id, attr_vals: item.attr_vals.join(',') }
          this.addGoodsForm.attrs.push(obj)
        })
        // 静态属性的vals本身为字符串不需转换
        this.onlyDataList.forEach(item => {
          const obj = { attr_id: item.attr_id, attr_vals: item.attr_vals }
          this.addGoodsForm.attrs.push(obj)
        })
        form.attrs = this.addGoodsForm.attrs
        // console.log(form);
        // 发起请求添加商品
        const {data: res} = await this.$http.post('goods', form)
        if(res.meta.status !== 201) {
          return this.$message.error({
            message: '添加商品失败!',
            duration: 1500
          })
        }
        this.$message.success({
          message: '添加商品成功',
          duration: 1500
        })
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    // 保存第三级分类ID
    cateId() {
      if(this.addGoodsForm.goods_cat.length !== 3) {
        return null
      }
      return this.addGoodsForm.goods_cat[2]
    }
  }
}
</script>

<style lang="less" scoped>
// .el-input {
//   width: 750px;
// }
.back {
  margin: 2px 0 16px 0;
  font-size: 12px;
  line-height: 1;
  color: #606266;
  cursor: pointer;
}
.back:hover span{
  color: #409EFF;
}
.goodsInfo {
  padding: 0 130px 0 50px;
}
.goodsParms {
  padding: 0 130px 0 50px;
}
.goodsProps {
  padding: 0 130px 0 50px;
}
.goodsPics {
  padding: 0 130px 0 50px;
  height: 320px;
}
.goodsContent {
  padding: 0 130px 0 50px;
}
.el-checkbox {
  margin: 0 20px 0 0 !important;
}
.el-checkbox-group {
  margin-top: -10px;
  padding-top: 10px;
  border-top: 1px solid #C0C4CC;
}
.el-step {
  margin: 20px 0;
}
.el-step__title {
  font-size: 14px;
  font-family: '微软雅黑';
  line-height: 30px;
  font-weight: unset;
}
// 图片预览对话框
// /deep/.el-dialog {
//   background: transparent;
//   box-shadow: unset;
// }
// /deep/.el-dialog__header {
//   padding: 0;
// }
// /deep/.el-dialog__body {
//   padding: 0;
// }

// el-scrollbar设置,超过max-height显示滚动条
.wrap-class {
  max-height: 300px;
}
.upload {
  width: 99%;
}
/deep/.pic-uploader .el-upload {
  width: 100% ;
  height: 92px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  overflow: hidden;
  display: inline-block; 
  box-sizing: border-box;
}
/deep/.pic-uploader .el-upload:hover {
  border-color: #409EFF;
}
.pic-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100%;
  line-height: 92px;
}
// 富文本编辑器
/deep/.ql-editor {
  height: 215px;
}
.addGoods {
  margin-top: 10px;
}
</style>