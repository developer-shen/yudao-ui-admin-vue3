<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
    <el-form-item label="财务人员" prop="financeUserId">
        <el-select
          v-model="formData.financeUserId"
          clearable
          filterable
          placeholder="请选择财务人员"
          class="!w-240px"
        >
          <el-option
            v-for="item in userList"
            :key="item.id"
            :label="item.nickname"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="付款时间" prop="paymentTime">
        <el-date-picker
          v-model="formData.paymentTime"
          type="date"
          value-format="x"
          placeholder="选择付款时间"
        />
      </el-form-item>
      <el-form-item label="实付金额" prop="paymentPrice">
        <el-input v-model="formData.paymentPrice" placeholder="请输入实付金额" />
      </el-form-item>
      <el-form-item label="付款方式" prop="paymentWay">
        <el-input v-model="formData.paymentWay" placeholder="请输入付款方式" />
      </el-form-item>
      <el-form-item label="付款用途" prop="paymentPurpose">
        <el-input v-model="formData.paymentPurpose" placeholder="请输入付款用途" />
      </el-form-item>
      <el-form-item label="附件" prop="fileUrl">
        <UploadImg v-model="formData.fileUrl" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { FinancePaymentListApi, FinancePaymentListVO } from '@/api/erp/financepaymentlist'
import * as UserApi from '@/api/system/user'

/** ERP 付款清单 表单 */
defineOptions({ name: 'FinancePaymentListForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  financeUserId: undefined,
  paymentTime: undefined,
  paymentPrice: undefined,
  paymentWay: undefined,
  paymentPurpose: undefined,
  fileUrl: undefined,
  remark: undefined
})
const formRules = reactive({
  paymentTime: [{ required: true, message: '付款时间不能为空', trigger: 'blur' }],
  paymentPrice: [{ required: true, message: '实付金额不能为空', trigger: 'blur' }],
  paymentWay: [{ required: true, message: '付款方式不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref
const userList = ref<UserApi.UserVO[]>([]) // 用户列表

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
      formData.value = await FinancePaymentListApi.getFinancePaymentList(id)
    } finally {
      formLoading.value = false
    }
  }
  // 加载用户列表
  userList.value = await UserApi.getSimpleUserList()
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
    const data = formData.value as unknown as FinancePaymentListVO
    if (formType.value === 'create') {
      await FinancePaymentListApi.createFinancePaymentList(data)
      message.success(t('common.createSuccess'))
    } else {
      await FinancePaymentListApi.updateFinancePaymentList(data)
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
    financeUserId: undefined,
    paymentTime: undefined,
    paymentPrice: undefined,
    paymentWay: undefined,
    paymentPurpose: undefined,
    fileUrl: undefined,
    remark: undefined
  }
  formRef.value?.resetFields()
}
</script>