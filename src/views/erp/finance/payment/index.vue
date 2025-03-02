<template>
  <ContentWrap>
    <el-row :gutter="24">
      <!-- 搜索工作栏 -->
      <el-col :span="12">
        <el-form
          class="-mb-15px"
          :model="queryParams"
          ref="queryFormRef"
          :inline="true"
          label-width="68px"
        >
          <el-form-item label="供应商" prop="supplierId">
            <el-select
              v-model="queryParams.supplierId"
              clearable
              filterable
              placeholder="请选择供应商"
              class="!w-240px"
            >
              <el-option
                v-for="item in supplierList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="付款账户" prop="accountId">
            <el-select
              v-model="queryParams.accountId"
              clearable
              filterable
              placeholder="请选择付款账户"
              class="!w-240px"
            >
              <el-option
                v-for="item in accountList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="付款时间" prop="paymentTime">
            <el-date-picker
              v-model="queryParams.paymentTime"
              value-format="YYYY-MM-DD HH:mm:ss"
              type="daterange"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
              class="!w-240px"
            />
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="queryParams.remark"
              placeholder="请输入备注"
              clearable
              @keyup.enter="handleQuery"
              class="!w-240px"
            />
          </el-form-item>

          <el-form-item>
            <el-button @click="handleQuery" type="primary"
              ><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button
            >
            <el-button @click="resetQuery"
              ><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button
            >
            <el-button
              type="primary"
              plain
              @click="openForm('create')"
              v-hasPermi="['erp:finance-payment:create']"
            >
              <Icon icon="ep:plus" class="mr-5px" /> 新增
            </el-button>
            <el-button
              type="success"
              plain
              @click="handleExport"
              :loading="exportLoading"
              v-hasPermi="['erp:finance-payment:export']"
            >
              <Icon icon="ep:download" class="mr-5px" /> 导出
            </el-button>
            <el-button
              type="danger"
              plain
              @click="handleDelete(selectionList.map((item) => item.id))"
              v-hasPermi="['erp:finance-payment:delete']"
              :disabled="selectionList.length === 0"
            >
              <Icon icon="ep:delete" class="mr-5px" /> 删除
            </el-button>
          </el-form-item>
        </el-form>
      </el-col>

      <!-- 统计 -->
      <el-col :span="12">
        <el-card shadow="hover" class="mb-8px">
          <el-row :gutter="24">
            <el-col :span="24">
              <el-progress
                :text-inside="true"
                :stroke-width="40"
                :percentage="statistic.percentage"
                status="warning"
              />
            </el-col>
            <el-col :span="10">
              <el-statistic title="已结算金额" :value="statistic.amountPaid" />
            </el-col>
            <el-col :span="10">
              <el-statistic title="待结算金额" :value="statistic.unpaidAmount" />
            </el-col>
            <el-col :span="4">
              <el-statistic title="采购总金额" :value="statistic.totalPayment" />
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
      v-loading="loading"
      :data="list"
      :stripe="true"
      show-summary
      :summary-method="footerMethod"
      @selection-change="handleSelectionChange"
    >
      <el-table-column width="80" label="选择" type="selection" />
      <el-table-column label="供应商" align="center" prop="supplierName" />
      <el-table-column label="付款账户" align="center" prop="accountName" />
      <el-table-column
        label="实付金额/￥"
        align="center"
        prop="paymentPrice"
        :formatter="erpPriceTableColumnFormatter"
      />
      <el-table-column
        label="付款时间"
        align="center"
        prop="paymentTime"
        :formatter="dateFormatter2"
        width="120px"
      />
      <el-table-column label="备注" align="center" prop="remark" width="550" />
      <el-table-column label="操作" align="center" fixed="right" width="280">
        <template #default="scope">
          <el-button
            type="warning"
            link
            @click="openPlForm(scope.row.paymentListId)"
            v-hasPermi="['erp:finance-payment-list:query']"
          >
            <Icon icon="fa-solid:search-dollar" />
            付款详情
          </el-button>
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['erp:finance-payment:update']"
            :disabled="scope.row.status === 20"
          >
            编辑
          </el-button>
          <el-button
            link
            type="primary"
            @click="handleUpdateStatus(scope.row.id, 20)"
            v-hasPermi="['erp:finance-payment:update-status']"
            v-if="scope.row.status === 10"
          >
            审批
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleUpdateStatus(scope.row.id, 10)"
            v-hasPermi="['erp:finance-payment:update-status']"
            v-else
          >
            反审批
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete([scope.row.id])"
            v-hasPermi="['erp:finance-payment:delete']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <FinancePaymentForm ref="formRef" @success="getList" />

  <!-- 付款清单表单详情弹窗 -->
  <FinancePaymentListForm ref="plFormRef" @success="getList" />
</template>

<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { dateFormatter2 } from '@/utils/formatTime'
import download from '@/utils/download'
import { useTransition } from '@vueuse/core'
import { FinancePaymentApi, FinancePaymentVO } from '@/api/erp/finance/payment'
import FinancePaymentForm from './FinancePaymentForm.vue'
import { UserVO } from '@/api/system/user'
import * as UserApi from '@/api/system/user'
import { erpPriceTableColumnFormatter } from '@/utils'
import { SupplierApi, SupplierVO } from '@/api/erp/purchase/supplier'
import { AccountApi, AccountVO } from '@/api/erp/finance/account'
import FinancePaymentListForm from '@/views/erp/financepaymentlist/FinancePaymentListForm.vue'

/** ERP 付款单列表 */
defineOptions({ name: 'ErpPurchaseOrder' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<FinancePaymentVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  no: undefined,
  paymentTime: [],
  supplierId: undefined,
  creator: undefined,
  financeUserId: undefined,
  accountId: undefined,
  status: undefined,
  remark: undefined,
  bizNo: undefined
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中
const supplierList = ref<SupplierVO[]>([]) // 供应商列表
const userList = ref<UserVO[]>([]) // 用户列表
const accountList = ref<AccountVO[]>([]) // 账户列表
const statistic = ref({
  totalPayment: 0, // 采购总金额
  amountPaid: 0, // 已结算金额
  unpaidAmount: 0, // 待结算金额
  percentage: 0 // 结算百分比
}) //统计数据

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await FinancePaymentApi.getFinancePaymentPage(queryParams)
    list.value = data.list
    total.value = data.total

    const statisticData = await FinancePaymentApi.getStatistic(queryParams)
    statistic.value.totalPayment = statisticData.totalPayment
    statistic.value.amountPaid = statisticData.amountPaid
    statistic.value.unpaidAmount = statisticData.unpaidAmount
    statistic.value.percentage = statisticData.percentage
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 打开付款清单详情 */
const plFormRef = ref()
const openPlForm = (plId?: number) => {
  plFormRef.value.open('detail', plId)
}

/** 删除按钮操作 */
const handleDelete = async (ids: number[]) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await FinancePaymentApi.deleteFinancePayment(ids)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
    selectionList.value = selectionList.value.filter((item) => !ids.includes(item.id))
  } catch {}
}

/** 审批/反审批操作 */
const handleUpdateStatus = async (id: number, status: number) => {
  try {
    // 审批的二次确认
    await message.confirm(`确定${status === 20 ? '审批' : '反审批'}该付款单吗？`)
    // 发起审批
    await FinancePaymentApi.updateFinancePaymentStatus(id, status)
    message.success(`${status === 20 ? '审批' : '反审批'}成功`)
    // 刷新列表
    await getList()
  } catch {}
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await FinancePaymentApi.exportFinancePayment(queryParams)
    download.excel(data, '付款单.xlsx')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 选中操作 */
const selectionList = ref<FinancePaymentVO[]>([])
const handleSelectionChange = (rows: FinancePaymentVO[]) => {
  selectionList.value = rows
}

/** 合计行 */
const footerMethod = (params: { columns: any; data: any }) => {
  const { columns, data } = params
  const sums: (string | number)[] = []

  columns.forEach((column, index) => {
    if (index === 0) {
      // 第一列显示 "合计"
      sums[index] = '合计'
      return
    }

    // 只计算数值列
    const key = column.property
    if (['paymentPrice'].includes(key)) {
      const total = data.reduce((sum: number, row: any) => {
        const value = parseFloat(row[key])
        return sum + (isNaN(value) ? 0 : value)
      }, 0)
      sums[index] = total.toFixed(2) // 保留两位小数
    } else {
      sums[index] = '' // 其他列不显示合计
    }
  })

  return sums
}

/** 初始化 **/
onMounted(async () => {
  await getList()
  // 加载供应商、用户、账户
  supplierList.value = await SupplierApi.getSupplierSimpleList()
  userList.value = await UserApi.getSimpleUserList()
  accountList.value = await AccountApi.getAccountSimpleList()
})
// TODO 芋艿：可优化功能：列表界面，支持导入
// TODO 芋艿：可优化功能：详情界面，支持打印
</script>
