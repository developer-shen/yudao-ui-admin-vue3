<!-- ERP 产品预估利润 -->
<template>
  <Dialog v-model="dialogVisible" title="预估利润" width="900px">
    <el-card style="margin-bottom: 20px; background-color: #e2d2b4">
      <template #header>
        <div class="card-header">
          <span>收入 = 销售价格</span>
          <br />
          <span
            >支出 = (采购价格+头程费用+尾程费用) + 退货率*(采购价格+销售价格+退货运费) + 广告费用 + 其他费用
          </span>
          <br />
          <span>
            利润 = 销售价格 - (采购价格+头程费用+尾程费用) - 退货率*(采购价格+销售价格+退货运费) - 广告费用 - 其他费用
          </span>
        </div>
      </template>
      <div v-if="showProfit" style="padding-left: 33px">
        <span>= {{ formData.salePrice }} - ({{ formData.purchasePrice }}+{{
            formData.firstLegPrice
          }}+{{ formData.lastMilePrice }}) - {{ formData.refundRate }}*({{
            formData.purchasePrice
          }}+{{ formData.salePrice }}+{{ formData.refundFreight }}) - {{ formData.adPrice }} - {{ formData.otherPrice }}
        </span>
        <br />
        <span> = {{ formData.profit }} </span>
      </div>
      <template #footer>
        <div style="display: flex; justify-content: center">
          <el-button @click="submitForm" type="primary" :disabled="formLoading"
            ><Icon icon="ep:edit-pen" />估 算</el-button
          >
        </div>
      </template>
    </el-card>

    <el-form
      ref="profitFormRef"
      :model="formData"
      :rules="formRules"
      label-width="80px"
      v-loading="formLoading"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="头程费用" prop="firstLegPrice">
            <el-input-number v-model="formData.firstLegPrice" :precision="2" :step="1" :min="0" style="width: 70%">
              <template #prefix>
                <span>￥</span>
              </template>
            </el-input-number>
            <el-input
              v-model="formData.firstLegPrice"
              :formatter="(value) => `$${(value / usdcny).toFixed(1)}`"
              style="width: 30%"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="尾程费用" prop="lastMilePrice">
            <el-input-number v-model="formData.lastMilePrice" :precision="2" :step="1" :min="0" style="width: 70%">
              <template #prefix>
                <span>￥</span>
              </template>
            </el-input-number>
            <el-input
              v-model="formData.lastMilePrice"
              :formatter="(value) => `$${(value / usdcny).toFixed(1)}`"
              style="width: 30%"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="退货率" prop="refundRate">
            <el-input-number
              v-model="formData.refundRate"
              :precision="2"
              :step="0.1"
              :min="0"
              :max="1"
              style="width: 70%"
            />
            <el-input
              v-model="formData.refundRate"
              :formatter="(value) => `${(value * 100).toFixed(0)}%`"
              style="width: 30%"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="退货运费" prop="refundFreight">
            <el-input-number v-model="formData.refundFreight" :precision="2" :step="1" :min="0" style="width: 70%">
              <template #prefix>
                <span>￥</span>
              </template>
            </el-input-number>
            <el-input
              v-model="formData.refundFreight"
              :formatter="(value) => `$${(value / usdcny).toFixed(1)}`"
              style="width: 30%"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="采购价格" prop="purchasePrice">
            <el-input-number v-model="formData.purchasePrice" :precision="2" :step="1" :min="0" style="width: 70%">
              <template #prefix>
                <span>￥</span>
              </template>
            </el-input-number>
            <el-input
              v-model="formData.purchasePrice"
              :formatter="(value) => `$${(value / usdcny).toFixed(1)}`"
              style="width: 30%"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="销售价格" prop="salePrice">
            <el-input-number v-model="formData.salePrice" :precision="2" :step="1" :min="0" style="width: 70%">
              <template #prefix>
                <span>￥</span>
              </template>
            </el-input-number>
            <el-input
              v-model="formData.salePrice"
              :formatter="(value) => `$${(value / usdcny).toFixed(1)}`"
              style="width: 30%"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="广告费用" prop="adPrice">
            <el-input-number v-model="formData.adPrice" :precision="2" :step="1" :min="0" style="width: 70%">
              <template #prefix>
                <span>￥</span>
              </template>
            </el-input-number>
            <el-input
              v-model="formData.adPrice"
              :formatter="(value) => `$${(value / usdcny).toFixed(1)}`"
              style="width: 30%"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="其他费用" prop="otherPrice">
            <el-input-number v-model="formData.otherPrice" :precision="2" :step="1" :min="0" style="width: 70%">
              <template #prefix>
                <span>￥</span>
              </template>
            </el-input-number>
            <el-input
              v-model="formData.otherPrice"
              :formatter="(value) => `$${(value / usdcny).toFixed(1)}`"
              style="width: 30%"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="其他详情" prop="otherDetail">
            <el-input v-model="formData.otherDetail" placeholder="请输入其他费用详情" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input type="textarea" v-model="formData.remark" placeholder="请输入备注" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </Dialog>
</template>
<script setup lang="ts">
import { ProductApi, ProductProfitVO } from '@/api/erp/product/product'

/** ERP 产品利润 表单 */
defineOptions({ name: 'ProductProfitForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined, // 编号
  productId: undefined, // 产品编号
  profit: undefined, // 产品利润
  purchasePrice: undefined, // 采购价格
  salePrice: undefined, // 销售价格
  firstLegPrice: undefined, // 头程价格
  lastMilePrice: undefined, // 尾程价格
  refundRate: undefined, // 退货率
  refundFreight: undefined, // 退货运费
  adPrice: undefined, // 广告费用
  otherPrice: undefined, // 其他费用
  otherDetail: undefined, // 其他费用详情
  remark: undefined // 备注
})
const formRules = reactive({
  purchasePrice: [{ required: true, message: '采购价格不能为空', trigger: 'blur' }],
  salePrice: [{ required: true, message: '销售价格不能为空', trigger: 'blur' }],
  firstLegPrice: [{ required: true, message: '头程费用不能为空', trigger: 'blur' }],
  lastMilePrice: [{ required: true, message: '尾程费用不能为空', trigger: 'blur' }],
  refundRate: [{ required: true, message: '退货率不能为空', trigger: 'blur' }],
  refundFreight: [{ required: true, message: '退货运费不能为空', trigger: 'blur' }],
  adPrice: [{ required: true, message: '广告费用不能为空', trigger: 'blur' }],
  otherPrice: [{ required: true, message: '其他费用不能为空', trigger: 'blur' }]
})
const profitFormRef = ref() // 表单 Ref
const profitId = ref() // profitId
const showProfit = ref(false) // 是否显示利润
const usdcny = ref(7.26) // 美元人民币汇率

/** 打开弹窗 */
const open = async (type: string, productId?: number, id?: number) => {
  showProfit.value = false
  dialogVisible.value = true
  formType.value = type

  resetForm()

  // 新增时，给表单设置初始值
  if (formType.value === 'create' && productId) {
    try {
      formData.value.productId = productId
      const product = await ProductApi.getProduct(productId)
      formData.value.purchasePrice = product.purchasePrice // 采购价格
      formData.value.salePrice = product.salePrice // 销售价格

      // 初始值, 需要根据实际情况调整
      formData.value.firstLegPrice = 3.5 // 头程价格 $3.5
      formData.value.lastMilePrice = (usdcny.value * 1.3).toFixed(1) // 尾程价格 $1.3提单费
      formData.value.refundRate = 0.1 // 退货率 10%
      formData.value.refundFreight = (usdcny.value * 6).toFixed(1) // 退货运费 $6
      formData.value.adPrice = usdcny.value // 广告费用
      formData.value.otherPrice = 0 // 其他费用
    } finally {
    }
  }

  // 修改时，设置数据
  if (formType.value === 'update' && id !== undefined && id !== null && id !== 0) {
    profitId.value = id
    formLoading.value = true
    showProfit.value = true

    try {
      formData.value = await ProductApi.getProductProfit(id)
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
  await profitFormRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as ProductProfitVO
    // 计算利润，保留2位小数，将结果转换为数字类型
    data.profit = parseFloat(
      (
        Number(data.salePrice) -
        (Number(data.purchasePrice) + Number(data.firstLegPrice) + Number(data.lastMilePrice)) -
        Number(data.refundRate) *
          (Number(data.purchasePrice) + Number(data.salePrice) + Number(data.refundFreight)) -
          Number(data.adPrice) - Number(data.otherPrice)
      ).toFixed(2)
    )
    // 显示利润
    showProfit.value = true

    if (formType.value === 'create') {
      await ProductApi.createProductProfit(data)
    } else {
      await ProductApi.updateProductProfit(data)
    }
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined, // 编号
    productId: undefined, // 产品编号
    profit: undefined, // 产品利润
    purchasePrice: undefined, // 采购价格
    salePrice: undefined, // 销销售价格格
    firstLegPrice: undefined, // 头程价格
    lastMilePrice: undefined, // 尾程价格
    refundRate: undefined, // 退货率
    refundFreight: undefined, // 退货运费
    adPrice: undefined, // 广告费用
    otherPrice: undefined, // 其他费用
    otherDetail: undefined, // 其他费用详情
    remark: undefined // 备注
  }
  profitFormRef.value?.resetFields()
}
</script>
<style scoped>
.el-form-item {
  margin-bottom: 1px; /* 缩短每一项之间的间距 */
}

.el-row {
  margin-bottom: 1px; /* 设置行距 */
}

.el-col {
  margin-bottom: 1px; /* 设置列之间的间距 */
}
</style>