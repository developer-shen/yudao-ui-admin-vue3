<!-- ERP 产品的新增/修改 -->
<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="skc货号" prop="name">
            <el-input v-model="formData.name" placeholder="请输入skc货号" />
          </el-form-item>
        </el-col>
       
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio
                v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
                :key="dict.value"
                :value="dict.value"
              >
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
       
        <el-col :span="12">
          <el-form-item label="采购价格" prop="purchasePrice">
            <el-input-number
              v-model="formData.purchasePrice"
              placeholder="请输入采购价格，单位：元"
              :min="0"
              :precision="2"
              class="!w-1/1"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="销售价格" prop="salePrice">
            <el-input-number
              v-model="formData.salePrice"
              placeholder="请输入销售价格，单位：元"
              :min="0"
              :precision="2"
              class="!w-1/1"
            />
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
</template>
<script setup lang="ts">
import { ProductApi, ProductVO } from '@/api/erp/product/product'
import { ProductCategoryApi, ProductCategoryVO } from '@/api/erp/product/category'
import { ProductUnitApi, ProductUnitVO } from '@/api/erp/product/unit'
import { CommonStatusEnum } from '@/utils/constants'
import { defaultProps, handleTree } from '@/utils/tree'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

/** ERP 产品 表单 */
defineOptions({ name: 'ProductForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  name: undefined,
  barCode: undefined,
  categoryId: undefined,
  unitId: undefined,
  status: undefined,
  standard: undefined,
  remark: undefined,
  expiryDay: undefined,
  weight: undefined,
  purchasePrice: undefined,
  salePrice: undefined,
  minPrice: undefined
})
const formRules = reactive({
  name: [{ required: true, message: 'skc货号不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '产品状态不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref
const categoryList = ref<ProductCategoryVO[]>([]) // 产品分类列表
const unitList = ref<ProductUnitVO[]>([]) // 产品单位列表

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await ProductApi.getProduct(id)
    } finally {
      formLoading.value = false
    }
  }
  // 产品分类
  const categoryData = await ProductCategoryApi.getProductCategorySimpleList()
  categoryList.value = handleTree(categoryData, 'id', 'parentId')
  // 产品单位
  unitList.value = await ProductUnitApi.getProductUnitSimpleList()
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as ProductVO
    if (formType.value === 'create') {
      await ProductApi.createProduct(data)
      message.success(t('common.createSuccess'))
    } else {
      await ProductApi.updateProduct(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    name: undefined,
    barCode: undefined,
    categoryId: undefined,
    unitId: undefined,
    status: CommonStatusEnum.ENABLE,
    standard: undefined,
    remark: undefined,
    expiryDay: undefined,
    weight: undefined,
    purchasePrice: undefined,
    salePrice: undefined,
    minPrice: undefined
  }
  formRef.value?.resetFields()
}
</script>
