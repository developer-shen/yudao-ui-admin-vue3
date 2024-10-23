<template>
  <doc-alert title="ERP 手册（功能开启）" url="https://doc.iocoder.cn/erp/build/" />

  <div class="flex flex-col">
    <!-- 销售/采购的全局统计 -->
    <!-- <el-row :gutter="16" class="row">
      <el-col :md="6" :sm="12" :xs="24" :loading="loading">
        <SummaryCard title="今日销售" :value="saleSummary?.todayPrice" />
      </el-col>
      <el-col :md="6" :sm="12" :xs="24" :loading="loading">
        <SummaryCard title="昨日销售" :value="saleSummary?.yesterdayPrice" />
      </el-col>
      <el-col :md="6" :sm="12" :xs="24" :loading="loading">
        <SummaryCard title="今日采购" :value="purchaseSummary?.todayPrice" />
      </el-col>
      <el-col :md="6" :sm="12" :xs="24" :loading="loading">
        <SummaryCard title="昨日采购" :value="purchaseSummary?.yesterdayPrice" />
      </el-col>
      <el-col :md="6" :sm="12" :xs="24" :loading="loading">
        <SummaryCard title="本月销售" :value="saleSummary?.monthPrice" />
      </el-col>
      <el-col :md="6" :sm="12" :xs="24" :loading="loading">
        <SummaryCard title="今年销售" :value="saleSummary?.yearPrice" />
      </el-col>
      <el-col :md="6" :sm="12" :xs="24" :loading="loading">
        <SummaryCard title="本月采购" :value="purchaseSummary?.monthPrice" />
      </el-col>
      <el-col :md="6" :sm="12" :xs="24" :loading="loading">
        <SummaryCard title="今年采购" :value="purchaseSummary?.yearPrice" />
      </el-col>
    </el-row> -->

    <!-- 销售订单统计 -->
    <el-row :gutter="16" class="row">
      <el-col :md="24" :sm="24" :xs="24" :loading="loading">
        <TimeSummaryChart title="销售订单" :value="saleNumTimeSummaryList">
          <!-- 在标题右侧添加按钮 -->
          <template #header-right>
            <el-button-group>
              <el-button type="primary" @click="handleButtonClick('A',7)">近一周</el-button>
              <el-button type="primary" @click="handleButtonClick('A',31)">近一月</el-button>
              <el-button type="primary" @click="handleButtonClick('A',365)">近一年</el-button>
            </el-button-group>
          </template>
        </TimeSummaryChart>
      </el-col>
    </el-row>

    <!-- 销售金额统计 -->
    <el-row :gutter="16" class="row">
      <el-col :md="24" :sm="24" :xs="24" :loading="loading">
        <TimeSummaryChart title="销售金额" :value="saleMoneyTimeSummaryList" >
          <!-- 在标题右侧添加按钮 -->
          <template #header-right>
            <el-button-group>
              <el-button type="primary" @click="handleButtonClick('B',7)">近一周</el-button>
              <el-button type="primary" @click="handleButtonClick('B',31)">近一月</el-button>
              <el-button type="primary" @click="handleButtonClick('B',365)">近一年</el-button>
            </el-button-group>
          </template>
        </TimeSummaryChart>
      </el-col>
    </el-row>

    <!-- skc销售订单统计 -->
    <el-row :gutter="16" class="row">
      <el-col :md="12" :sm="12" :xs="12" :loading="loading">
        <TimeSummaryChart title="skc销售订单：temu" :value="saleTemuSkcNumTimeSummaryList" >
          <!-- 在标题右侧添加按钮 -->
          <template #header-right>
            <el-button-group>
              <el-button type="primary" @click="handleButtonClick('C',7)">近一周</el-button>
              <el-button type="primary" @click="handleButtonClick('C',31)">近一月</el-button>
              <el-button type="primary" @click="handleButtonClick('C',365)">近一年</el-button>
            </el-button-group>
          </template>
        </TimeSummaryChart>
      </el-col>
      <el-col :md="12" :sm="12" :xs="12" :loading="loading">
        <TimeSummaryChart title="skc销售订单：tiktok" :value="saleTiktokSkcNumTimeSummaryList" >
          <!-- 在标题右侧添加按钮 -->
          <template #header-right>
            <el-button-group>
              <el-button type="primary" @click="handleButtonClick('D',7)">近一周</el-button>
              <el-button type="primary" @click="handleButtonClick('D',31)">近一月</el-button>
              <el-button type="primary" @click="handleButtonClick('D',365)">近一年</el-button>
            </el-button-group>
          </template>
        </TimeSummaryChart>
      </el-col>
    </el-row>
  </div>
</template>
<script lang="ts" setup>
import SummaryCard from './components/SummaryCard.vue'
import TimeSummaryChart from './components/TimeSummaryChart.vue'
import {
  ErpSaleSummaryRespVO,
  ErpSaleTimeSummaryRespVO,
  SaleStatisticsApi
} from '@/api/erp/statistics/sale'
import {
  ErpPurchaseSummaryRespVO,
  ErpPurchaseTimeSummaryRespVO,
  PurchaseStatisticsApi
} from '@/api/erp/statistics/purchase'

defineOptions({ name: 'ErpHome' })

const loading = ref(true) // 加载中

/** 获得销售订单统计 */
const saleNumTimeSummaryList = ref<ErpSaleTimeSummaryRespVO[]>() // 销售时段统计
const saleTemuSkcNumTimeSummaryList = ref<ErpSaleTimeSummaryRespVO[]>() // temu-skc销售时段统计
const saleTiktokSkcNumTimeSummaryList = ref<ErpSaleTimeSummaryRespVO[]>() // tiktok-skc销售时段统计
const getSaleNumSummary = async () => {
  saleNumTimeSummaryList.value = await SaleStatisticsApi.getSaleNumTimeSummary(31)
  saleTemuSkcNumTimeSummaryList.value = await SaleStatisticsApi.getSaleSkcNumTimeSummary(7,4)
  saleTiktokSkcNumTimeSummaryList.value = await SaleStatisticsApi.getSaleSkcNumTimeSummary(7,5)
}

/** 获得销售金额统计 */
const saleMoneyTimeSummaryList = ref<ErpSaleTimeSummaryRespVO[]>() // 销售时段统计
const getSaleMoneySummary = async () => {
  saleMoneyTimeSummaryList.value = await SaleStatisticsApi.getSaleMoneyTimeSummary(31)
}

/** 日期选择按钮 */
const handleButtonClick = async (type: string, count: number) => {
  if (type === 'A'){
    saleNumTimeSummaryList.value = await SaleStatisticsApi.getSaleNumTimeSummary(count)
  }
  else if (type === 'B'){
    saleMoneyTimeSummaryList.value = await SaleStatisticsApi.getSaleMoneyTimeSummary(count)
  }
  else if (type === 'C'){
    saleTemuSkcNumTimeSummaryList.value = await SaleStatisticsApi.getSaleSkcNumTimeSummary(count, 4)
  }
  else if (type === 'D'){
    saleTiktokSkcNumTimeSummaryList.value = await SaleStatisticsApi.getSaleSkcNumTimeSummary(count, 5)
  }
};

/** 初始化 **/
onMounted(async () => {
  loading.value = true
  await Promise.all([getSaleNumSummary(), getSaleMoneySummary()])
  loading.value = false
})
</script>
<style lang="scss" scoped>
.row {
  .el-col {
    margin-bottom: 1rem;
  }
}
</style>
