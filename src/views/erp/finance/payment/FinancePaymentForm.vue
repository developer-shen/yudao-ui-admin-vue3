<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
      :disabled="disabled"
    >
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="供应商" prop="supplierId">
            <el-select
              v-model="formData.supplierId"
              clearable
              filterable
              placeholder="请选择供应商"
              class="!w-1/1"
            >
              <el-option
                v-for="item in supplierList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="付款账户" prop="accountId">
            <el-select
              v-model="formData.accountId"
              clearable
              filterable
              placeholder="请选择结算账户"
              class="!w-1/1"
            >
              <el-option
                v-for="item in accountList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="实付金额">
            <el-input-number v-model="formData.paymentPrice" :precision="0" :step="1" :min="0" size="large">
              <template #prefix>
                <span>￥</span>
              </template>
            </el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="付款时间" prop="paymentTime">
            <el-date-picker
              v-model="formData.paymentTime"
              type="date"
              value-format="x"
              placeholder="选择付款时间"
              class="!w-1/1"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="付款编号" size="large">
            <el-input-number v-model="formData.paymentListId" :step="1" :min="0" />
            <el-button
              type="warning"
              link
              @click="openPlForm(formData.paymentListId)"
              v-hasPermi="['erp:finance-payment-list:query']"
            >
              <Icon icon="fa-solid:search-dollar" />
            </el-button>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="备注" prop="remark">
            <el-input
              type="textarea"
              v-model="formData.remark"
              :rows="1"
              placeholder="请输入备注"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading" v-if="!disabled">
        确 定
      </el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>

    <!-- 付款清单表单详情弹窗 -->
  <FinancePaymentListForm ref="plFormRef" />
</template>
<script setup lang="ts">
import { FinancePaymentApi, FinancePaymentVO } from '@/api/erp/finance/payment'
import FinancePaymentItemForm from './components/FinancePaymentItemForm.vue'
import { SupplierApi, SupplierVO } from '@/api/erp/purchase/supplier'
import { erpPriceInputFormatter, erpPriceMultiply } from '@/utils'
import * as UserApi from '@/api/system/user'
import { AccountApi, AccountVO } from '@/api/erp/finance/account'
import FinancePaymentListForm from '@/views/erp/financepaymentlist/FinancePaymentListForm.vue'
/** ERP 付款单表单 */
defineOptions({ name: 'FinancePaymentForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改；detail - 详情
const formData = ref({
  id: undefined,
  paymentListId: undefined,
  supplierId: undefined,
  accountId: undefined,
  financeUserId: undefined,
  paymentTime: undefined,
  remark: undefined,
  fileUrl: '',
  totalPrice: 0,
  discountPrice: 0,
  paymentPrice: 0,
  items: [],
  no: undefined // 订单单号，后端返回
})
const formRules = reactive({
  supplierId: [{ required: true, message: '供应商不能为空', trigger: 'blur' }],
  accountId: [{ required: true, message: '付款账户不能为空', trigger: 'blur' }],
  paymentPrice: [{ required: true, message: '实付金额不能为空', trigger: 'blur' }],
  paymentTime: [{ required: true, message: '订单时间不能为空', trigger: 'blur' }],
  paymentListId: [{ required: true, message: '付款编号不能为空', trigger: 'blur' }],
})
const disabled = computed(() => formType.value === 'detail')
const formRef = ref() // 表单 Ref
const supplierList = ref<SupplierVO[]>([]) // 供应商列表
const accountList = ref<AccountVO[]>([]) // 账户列表
const userList = ref<UserApi.UserVO[]>([]) // 用户列表

/** 子表的表单 */
const subTabsName = ref('item')
const itemFormRef = ref()

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
      formData.value = await FinancePaymentApi.getFinancePayment(id)
    } finally {
      formLoading.value = false
    }
  }
  // 加载供应商列表
  supplierList.value = await SupplierApi.getSupplierSimpleList()
  // 加载用户列表
  userList.value = await UserApi.getSimpleUserList()
  // 加载账户列表
  accountList.value = await AccountApi.getAccountSimpleList()
  const defaultAccount = accountList.value.find((item) => item.defaultStatus)
  if (defaultAccount) {
    formData.value.accountId = defaultAccount.id
  }
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
    const data = formData.value as unknown as FinancePaymentVO
    if (formType.value === 'create') {
      await FinancePaymentApi.createFinancePayment(data)
      message.success(t('common.createSuccess'))
    } else {
      await FinancePaymentApi.updateFinancePayment(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 打开付款清单详情 */
const plFormRef = ref()
const openPlForm = (plId?: number) => {
  plFormRef.value.open('detail', plId)
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    paymentListId: undefined,
    supplierId: undefined,
    accountId: undefined,
    financeUserId: undefined,
    paymentTime: undefined,
    remark: undefined,
    fileUrl: undefined,
    totalPrice: 0,
    discountPrice: 0,
    paymentPrice: 0,
    items: [],
    no: undefined
  }
  formRef.value?.resetFields()
}
</script>
