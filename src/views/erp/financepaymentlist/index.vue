<template>
  <ContentWrap>
    <el-row class="mt-8px" :gutter="8" justify="space-between">
      <el-form
        class="-mb-15px"
        :model="queryParams"
        ref="queryFormRef"
        :inline="true"
        label-width="68px"
        style="width: 100%"
      >
        <!-- 按钮工作栏 -->
        <div style="display: flex; align-items: center">
          <el-form-item>
            <el-button @click="handleQuery" type="primary"
              ><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button
            >
            <el-button @click="resetQuery" type="info" plain
              ><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button
            >

            <el-button
              type="primary"
              plain
              @click="openForm('create')"
              v-hasPermi="['erp:finance-payment-list:create']"
            >
              <Icon icon="ep:plus" class="mr-5px" /> 新增
            </el-button>
            <el-button
              type="success"
              plain
              @click="handleExport"
              :loading="exportLoading"
              v-hasPermi="['erp:finance-payment-list:export']"
            >
              <Icon icon="ep:download" class="mr-5px" /> 导出
            </el-button>
          </el-form-item>
          <div style="position: absolute; right: 0; display: flex; align-items: center">
            <span>总支出：</span>
            <el-statistic :value="totalPriceLive" />
            <span style="margin-left: 5px">元</span>
          </div>
        </div>
        <!-- 搜索工作栏 -->
        <div>
          <el-divider @click="showFilter()" style="margin-top: 0"
            >{{ isShowFilter ? '收起筛选' : '展开筛选' }}<Icon icon="ep:filter"
          /></el-divider>
        </div>

        <div v-show="isShowFilter">
          <el-form-item label="财务人员" prop="financeUserId">
            <el-select
              v-model="queryParams.financeUserId"
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
              v-model="queryParams.paymentTime"
              value-format="YYYY-MM-DD HH:mm:ss"
              type="daterange"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
              class="!w-220px"
            />
          </el-form-item>
          <el-form-item label="实付金额" prop="paymentPrice">
            <el-input
              v-model="queryParams.paymentPrice"
              placeholder="请输入实付金额"
              clearable
              @keyup.enter="handleQuery"
              class="!w-240px"
            />
          </el-form-item>
          <el-form-item label="付款方式" prop="paymentWay">
            <el-input
              v-model="queryParams.paymentWay"
              placeholder="请输入付款方式"
              clearable
              @keyup.enter="handleQuery"
              class="!w-240px"
            />
          </el-form-item>
          <el-form-item label="付款用途" prop="paymentPurpose">
            <el-input
              v-model="queryParams.paymentPurpose"
              placeholder="请输入付款用途"
              clearable
              @keyup.enter="handleQuery"
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
          <el-form-item label="创建人" prop="creator">
            <el-select
              v-model="queryParams.creator"
              clearable
              filterable
              placeholder="请选择创建人"
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
          <el-form-item label="创建时间" prop="createTime">
            <el-date-picker
              v-model="queryParams.createTime"
              value-format="YYYY-MM-DD HH:mm:ss"
              type="daterange"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
              class="!w-220px"
            />
          </el-form-item>
        </div>
      </el-form>
    </el-row>
  </ContentWrap>

  <!-- 统计图 -->
  <ContentWrap>
    <el-row class="mt-8px" :gutter="8" justify="space-between">
      <!-- 饼状图 -->
      <el-col :xl="8" :lg="8" :md="8" :sm="8" :xs="8" class="mb-8px">
        <el-skeleton :loading="loading" animated>
          <el-card shadow="hover" class="mb-8px">
            <el-skeleton :loading="loading" animated>
              <Echart :options="pieOptionsData" :height="200" />
            </el-skeleton>
          </el-card>
        </el-skeleton>
      </el-col>

      <!-- 柱状图 -->
      <el-col :xl="16" :lg="16" :md="16" :sm="16" :xs="16" class="mb-8px">
        <el-skeleton :loading="loading" animated>
          <el-card shadow="hover" class="mb-8px">
            <el-skeleton :loading="loading" animated>
              <Echart :options="barOptionsData" :height="200" />
            </el-skeleton>
          </el-card>
        </el-skeleton>
      </el-col>
    </el-row>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="财务人员" align="center" prop="financeUserName" />
      <el-table-column
        label="付款时间"
        align="center"
        prop="paymentTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="实付金额" align="center" prop="paymentPrice" />
      <el-table-column label="付款方式" align="center" prop="paymentWay" />
      <el-table-column label="付款用途" align="center" prop="paymentPurpose" />
      <el-table-column label="附件" align="center" prop="fileUrl" width="110px">
        <template #default="{ row }">
          <el-image
            v-if="row.fileUrl"
            class="h-80px w-80px"
            lazy
            :src="row.fileUrl"
            :preview-src-list="[row.fileUrl]"
            preview-teleported
            fit="cover"
          />
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="创建者" align="center" prop="creatorName" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['erp:finance-payment-list:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['erp:finance-payment-list:delete']"
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
  <FinancePaymentListForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { set } from 'lodash-es'
import { dateFormatter } from '@/utils/formatTime'
import { EChartsOption } from 'echarts'
import download from '@/utils/download'
import { FinancePaymentListApi, FinancePaymentListVO } from '@/api/erp/financepaymentlist'
import FinancePaymentListForm from './FinancePaymentListForm.vue'
import { UserVO } from '@/api/system/user'
import * as UserApi from '@/api/system/user'
import { log } from 'console'
import { useTransition } from '@vueuse/core'

/** ERP 付款清单 列表 */
defineOptions({ name: 'FinancePaymentList' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const isShowFilter = ref(false) // 是否显示筛选条件
const loading = ref(true) // 列表的加载中
const list = ref<FinancePaymentListVO[]>([]) // 列表的数据
const pieOptionsDataList = ref([]) // 饼状图的数据
const barOptionsDataList = ref([]) // 柱状图的数据
const totalPrice = ref(0) // 付款总数
const totalPriceLive = useTransition(totalPrice, { duration: 1500 }) // 付款总数(动画)

//收起展开搜索条件
const showFilter = () => {
  isShowFilter.value = !isShowFilter.value
}

const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  financeUserId: undefined,
  paymentTime: [],
  paymentPrice: undefined,
  paymentWay: undefined,
  paymentPurpose: undefined,
  fileUrl: undefined,
  remark: undefined,
  creator: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中
const userList = ref<UserVO[]>([]) // 用户列表

// 饼状图的配置
const pieOptions: EChartsOption = {
  // title: {
  //   text: '总支出',
  //   subtext: '0 元',
  //   left: 'left'
  // },
  tooltip: {
    trigger: 'item'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  series: [
    {
      name: '付款金额',
      type: 'pie',
      radius: '70%',
      center: ['50%', '50%'],
      data: []
    }
  ]
}
// 柱状图的配置
const barOptions: EChartsOption = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: {
    left: 100,
    right: 20,
    bottom: 20,
    top: 5
  },
  xAxis: {
    type: 'value' // 将 x 轴设置为 value 类型
  },
  yAxis: {
    type: 'category', // 将 y 轴设置为 category 类型
    data: [], // 类别数据
    axisTick: {
      alignWithLabel: true
    }
  },
  series: [
    {
      data: [],
      type: 'bar'
    }
  ]
}

// 饼状图数据
const pieOptionsData = reactive<EChartsOption>(pieOptions) as EChartsOption
// 柱状图数据
const barOptionsData = reactive<EChartsOption>(barOptions) as EChartsOption

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await FinancePaymentListApi.getFinancePaymentListPage(queryParams)
    list.value = data.list
    total.value = data.total
    pieOptionsDataList.value = data.side.pieOptionsDataList || []
    barOptionsDataList.value = data.side.barOptionsDataList || []

    // 获取支出统计数据
    await getStatisticsData()
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

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await FinancePaymentListApi.deleteFinancePaymentList(id)
    message.success(t('common.delSuccess'))
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
    const data = await FinancePaymentListApi.exportFinancePaymentList(queryParams)
    download.excel(data, 'ERP 付款清单.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

// 获取支出统计数据
const getStatisticsData = async () => {
  // 饼状图数据
  set(
    pieOptionsData,
    'legend.data',
    pieOptionsDataList.value.map((v) => t(v.name))
  )
  pieOptionsData!.series![0].data = pieOptionsDataList.value.map((v) => {
    return {
      name: t(v.name),
      value: v.value
    }
  })

  // 付款总数
  totalPrice.value = pieOptionsDataList.value.reduce((sum, item) => sum + item.value, 0)
  // pieOptionsData!.title = {
  //   text:
  //     queryParams.paymentTime.length == 2
  //       ? queryParams.paymentTime[0].substring(0, 10) +
  //         '至' +
  //         queryParams.paymentTime[1].substring(0, 10) +
  //         '总支出'
  //       : '总支出',
  //   subtext: totalPrice + ' 元'
  // }

  // 柱状图数据
  set(
    barOptionsData,
    'yAxis.data',
    barOptionsDataList.value.map((v) => t(v.name))
  )
  set(barOptionsData, 'series', [
    {
      data: barOptionsDataList.value.map((v) => v.value),
      type: 'bar'
    }
  ])
}

/** 初始化 **/
onMounted(async () => {
  await getList()
  // 加载用户
  userList.value = await UserApi.getSimpleUserList()
})
</script>