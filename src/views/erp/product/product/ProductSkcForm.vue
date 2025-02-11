<!-- ERP 产品skc变种的新增/修改 -->
<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="skcFormRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      v-loading="formLoading"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="spu货号" prop="barCode">
            <el-input v-model="formData.barCode" placeholder="请输入spu货号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="颜色" prop="color">
            <el-color-picker v-model="formData.color" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="skc变种名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入skc变种名称" />
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
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input type="textarea" v-model="formData.remark" placeholder="请输入备注" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="附件" prop="fileUrl">
            <UploadImg v-model="formData.fileUrl" />
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 删除按钮放置最右边 -->
      <el-row justify="end" v-if="formType === 'update'">
        <el-button @click="deleteSkc()" type="danger" :disabled="formLoading">删 除</el-button>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { ProductApi, ProductSkcVO } from '@/api/erp/product/product'
import { CommonStatusEnum } from '@/utils/constants'
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
  productId: undefined,
  unitId: undefined,
  status: undefined,
  standard: undefined,
  remark: undefined,
  fileUrl: undefined,
  expiryDay: undefined,
  weight: undefined,
  purchasePrice: undefined,
  salePrice: undefined,
  minPrice: undefined,
  color: undefined
})
const formRules = reactive({
  barCode: [{ required: true, message: 'spu货号不能为空', trigger: 'blur' }],
  name: [{ required: true, message: 'skc变种名称不能为空', trigger: 'blur' }],
  status: [{ required: true, message: 'skc状态不能为空', trigger: 'blur' }]
})
const skcFormRef = ref() // 表单 Ref
const skcId = ref() // skcId

/** 打开弹窗 */
const open = async (type: string, id?: number, productId?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type) + 'skc变种'
  formType.value = type

  resetForm()
  formData.value.productId = productId

  // 修改时，设置数据
  if (id && id !== 0) {
    skcId.value = id
    formLoading.value = true
    try {
      formData.value = await ProductApi.getProductSkc(id)
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
  await skcFormRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as ProductSkcVO

    if (formType.value === 'create') {
      await ProductApi.createProductSkc(data)
      message.success(t('common.createSuccess'))
    } else {
      await ProductApi.updateProductSkc(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 删除skc */
const deleteSkc = async () => {
  // 提交请求
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await ProductApi.deleteProductSkc(skcId.value)
    message.success(t('common.delSuccess'))
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    name: undefined,
    barCode: undefined,
    productId: undefined,
    unitId: undefined,
    status: CommonStatusEnum.ENABLE,
    standard: undefined,
    remark: undefined,
    fileUrl: undefined,
    expiryDay: undefined,
    weight: undefined,
    purchasePrice: undefined,
    salePrice: undefined,
    minPrice: undefined,
    color: undefined
  }
  skcFormRef.value?.resetFields()
}
</script>
