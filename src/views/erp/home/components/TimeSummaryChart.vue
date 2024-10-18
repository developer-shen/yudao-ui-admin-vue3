<template>
  <el-card shadow="never">
    <template #header>
      <CardTitle :title="props.title" />
    </template>
    <!-- 折线图 -->
    <Echart :height="300" :options="lineChartOptions" />
  </el-card>
</template>

<script lang="ts" setup>
import { EChartsOption } from 'echarts'
import { CardTitle } from '@/components/Card'
import { propTypes } from '@/utils/propTypes'

/** 会员用户统计卡片 */
defineOptions({ name: 'MemberStatisticsCard' })

const props = defineProps({
  title: propTypes.string.def('').isRequired,
  value: propTypes.array.isRequired // 假设 value 是数组类型，包含多个时间点的数据
})

/** 折线图配置 */
const lineChartOptions = reactive<EChartsOption>({
  grid: {
    left: 20,
    right: 20,
    bottom: 20,
    top: 80,
    containLabel: true
  },
  legend: {
    top: 50
  },
  toolbox: {
    feature: {
      dataZoom: {
        yAxisIndex: false // Y轴不缩放
      },
      brush: {
        type: ['lineX', 'clear'] // 区域缩放按钮、还原按钮
      },
      saveAsImage: { show: true, name: props.title } // 保存为图片
    }
  },
  tooltip: {
    trigger: 'axis',
   
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    axisTick: {
      show: false
    }
  },
  yAxis: {
    axisTick: {
      show: false
    }
  },
  series: [] // 动态生成的 series
}) as EChartsOption

// 监听 props.value 的变化并更新图表数据
watch(
  () => props.value,
  (val) => {
    if (!val || !Array.isArray(val)) {
      return
    }
    // 提取时间数据 (x轴)
    const times = val.map(item => item.time)
    
    // 提取动态字段的 series 数据
    const seriesData = {} // 存放不同字段的数据

    val.forEach(item => {
      const dataFields = item.data

      Object.keys(dataFields).forEach(key => {
        if (!seriesData[key]) {
          seriesData[key] = []
        }
        seriesData[key].push(dataFields[key])
      })
    })

    // 动态生成 series 配置
    lineChartOptions.series = Object.keys(seriesData).map(key => ({
      name: key,
      type: 'line',
      smooth: true,
      data: seriesData[key] // 使用对应字段的数据
    }))

    // 更新 xAxis 数据 (时间轴)
    lineChartOptions.xAxis.data = times
  },
  { immediate: true }
)
</script>