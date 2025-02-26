<!-- ERP 产品属性的新增/修改 -->
<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="attrFormRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      v-loading="formLoading"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="重量/g" prop="weight">
            <el-input-number v-model="formData.weight" :precision="2" :step="1" :min="0" />
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="尺码范围" prop="sizes">
            <el-input v-model="formData.sizes" placeholder="尺码范围" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="尺码表" prop="productMeasurements">
            <el-button @click="openSizeView" type="primary">查 看</el-button>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="成分" prop="composition">
            <el-input v-model="formData.composition" placeholder="请输入成分" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="洗涤说明" prop="careInstructions">
            <el-input v-model="formData.careInstructions" placeholder="洗涤说明" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input type="textarea" v-model="formData.remark" placeholder="请输入备注" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>

  <!-- 商品尺码表 -->
  <ProductSizeView ref="sizeRef"/>  
</template>
<script setup lang="ts">
import { ProductApi, ProductAttributesVO } from '@/api/erp/product/product'
import ProductSizeView from './ProductSizeView.vue'
/** ERP 产品属性 表单 */
defineOptions({ name: 'ProductAttrForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined, // 编号
  productId: undefined, // 产品编号
  weight: undefined, // 重量
  sizes: undefined, // 尺码范围
  stock: undefined, // 库存
  composition: undefined, // 成分
  productMeasurements: undefined, // 尺码表
  bodyMeasurements: undefined, // 基码表
  careInstructions: undefined, // 洗涤说明
  remark: undefined // 备注
})
const formRules = reactive({})
const attrFormRef = ref() // 表单 Ref
const attrId = ref() // attrId

/** 打开弹窗 */
const open = async (type: string, productId?: number, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type) + '产品规格'
  formType.value = type

  resetForm()
  formData.value.productId = productId

  // 修改时，设置数据
  if (id && id !== 0) {
    attrId.value = id
    formLoading.value = true
    try {
      formData.value = await ProductApi.getProductAttr(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await attrFormRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as ProductAttributesVO

    if (formType.value === 'create') {
      await ProductApi.createProductAttr(data)
      message.success(t('common.createSuccess'))
    } else {
      await ProductApi.updateProductAttr(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 删除attr */
const deleteAttr = async () => {
  // 提交请求
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await ProductApi.deleteProductAttr(attrId.value)
    message.success(t('common.delSuccess'))
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
  }
}

/** 打开尺码表 */
const sizeRef = ref()
const openSizeView= () => {
  sizeRef.value.open()
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined, // 编号
    productId: undefined, // 产品编号
    weight: undefined, // 重量
    sizes: undefined, // 尺码范围
    stock: undefined, // 库存
    composition: undefined, // 成分
    productMeasurements: undefined, // 尺码表
    bodyMeasurements: undefined, // 基码表
    careInstructions: undefined, // 洗涤说明
    remark: undefined // 备注
  }
  attrFormRef.value?.resetFields()
}
</script>
