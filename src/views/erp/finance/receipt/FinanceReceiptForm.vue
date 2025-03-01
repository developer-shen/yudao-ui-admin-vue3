<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="800">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
      :disabled="disabled"
    >
      <el-row :gutter="24">
        <!-- <el-col :span="8">
          <el-form-item label="收款单号" prop="no">
            <el-input disabled v-model="formData.no" placeholder="保存时自动生成" />
          </el-form-item>
        </el-col> -->
        <el-col :span="12">
          <el-form-item label="收款平台" prop="customerId">
            <el-select
              v-model="formData.customerId"
              clearable
              filterable
              placeholder="请选择收款平台"
              class="!w-1/1"
            >
              <el-option
                v-for="item in customerList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="收款账户" prop="accountId">
            <el-select
              v-model="formData.accountId"
              clearable
              filterable
              placeholder="请选择收款账户"
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
          <el-form-item label="合计收款" prop="totalPrice">
            <el-input-number v-model="formData.totalPrice" :precision="2" :step="1" :min="0" style="width: 100%">
              <template #prefix>
                <span>￥</span>
              </template>
            </el-input-number>
            <el-input
              v-model="formData.totalPrice"
              :formatter="(value) => `$${(value / usdcny).toFixed(2)}`"
              style="width: 100%"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="收款时间" prop="receiptTime">
            <el-date-picker
              v-model="formData.receiptTime"
              type="date"
              value-format="x"
              placeholder="选择收款时间"
              class="!w-1/1"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="实际到账">
            <el-input-number v-model="formData.receiptPrice" :precision="2" :step="1" :min="0" style="width: 100%">
              <template #prefix>
                <span>￥</span>
              </template>
            </el-input-number>
            <el-input
              v-model="formData.receiptPrice"
              :formatter="(value) => `$${(value / usdcny).toFixed(2)}`"
              style="width: 100%"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="到账时间" prop="receivedTime">
            <el-date-picker
              v-model="formData.receivedTime"
              type="date"
              value-format="x"
              placeholder="选择收款时间"
              class="!w-1/1"
            />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input
              type="textarea"
              v-model="formData.remark"
              placeholder="请输入备注"
            />
          </el-form-item>
        </el-col>
        <!-- <el-col :span="8">
          <el-form-item label="附件" prop="fileUrl">
            <UploadFile :is-show-tip="false" v-model="formData.fileUrl" :limit="1" />
          </el-form-item>
        </el-col> -->
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading" v-if="!disabled">
        确 定
      </el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { FinanceReceiptApi, FinanceReceiptVO } from '@/api/erp/finance/receipt'
import FinanceReceiptItemForm from './components/FinanceReceiptItemForm.vue'
import { erpPriceInputFormatter } from '@/utils'
import * as UserApi from '@/api/system/user'
import { AccountApi, AccountVO } from '@/api/erp/finance/account'
import { CustomerApi, CustomerVO } from '@/api/erp/sale/customer'

/** ERP 收款单表单 */
defineOptions({ name: 'FinanceReceiptForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改；detail - 详情
const formData = ref({
  id: undefined,
  customerId: undefined,
  accountId: undefined,
  financeUserId: undefined,
  receiptTime: undefined,
  receivedTime: undefined,
  remark: undefined,
  fileUrl: '',
  totalPrice: 0,
  discountPrice: 0,
  receiptPrice: 0,
  items: [],
  no: undefined // 订单单号，后端返回
})
const formRules = reactive({
  customerId: [{ required: true, message: '收款平台不能为空', trigger: 'blur' }],
  accountId: [{ required: true, message: '收款账户不能为空', trigger: 'blur' }],
  totalPrice: [{ required: true, message: '合计收款不能为空', trigger: 'blur' }],
  receiptTime: [{ required: true, message: '收款时间不能为空', trigger: 'blur' }],
})
const disabled = computed(() => formType.value === 'detail')
const formRef = ref() // 表单 Ref
const customerList = ref<CustomerVO[]>([]) // 平台列表
const accountList = ref<AccountVO[]>([]) // 账户列表
const userList = ref<UserApi.UserVO[]>([]) // 用户列表

/** 子表的表单 */
const subTabsName = ref('item')
const itemFormRef = ref()
const usdcny = ref(7.26) // 美元人民币汇率

/** 计算 discountPrice、totalPrice 价格 */
// watch(
//   () => formData.value,
//   (val) => {
//     if (!val) {
//       return
//     }
//     const totalPrice = val.items.reduce((prev, curr) => prev + curr.receiptPrice, 0)
//     formData.value.totalPrice = totalPrice
//     formData.value.receiptPrice = totalPrice - val.discountPrice
//   },
//   { deep: true }
// )

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
      formData.value = await FinanceReceiptApi.getFinanceReceipt(id)
    } finally {
      formLoading.value = false
    }
  }
  // 加载平台列表
  customerList.value = await CustomerApi.getCustomerSimpleList()
  // 加载用户列表
  //userList.value = await UserApi.getSimpleUserList()
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
  console.log(111);
  
  try {
    const data = formData.value as unknown as FinanceReceiptVO
    if (formType.value === 'create') {
        console.log(222);
      await FinanceReceiptApi.createFinanceReceipt(data)
      message.success(t('common.createSuccess'))
    } else {
      await FinanceReceiptApi.updateFinanceReceipt(data)
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
    customerId: undefined,
    accountId: undefined,
    financeUserId: undefined,
    receiptTime: undefined,
    receivedTime: undefined,
    remark: undefined,
    fileUrl: undefined,
    totalPrice: 0,
    discountPrice: 0,
    receiptPrice: 0,
    items: [],
    no: undefined
  }
  formRef.value?.resetFields()
}
</script>
