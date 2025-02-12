<template>
  <el-card shadow="never">
    <template #header>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <CardTitle :title="props.title" />
        <!-- 具名插槽，用于在标题右侧插入按钮 -->
        <slot name="header-right"></slot>
      </div>
    </template>
    <!-- 折线图 -->
    <Echart :height="300" :options="lineChartOptions" />
  </el-card>
</template>

<script lang="ts" setup>
import { EChartsOption } from 'echarts'
import { CardTitle } from '@/components/Card'
import { propTypes } from '@/utils/propTypes'

/** 统计卡片 */
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
    top: 50,
    containLabel: true
  },
  legend: {
    top: 0, // 设置 legend 距离顶部的距离
    left: 'center', // 将 legend 放置在图表上方居中
    textStyle: {
      color: '#ffffff',  // 文字颜色
      fontSize: 15,   // 文字大小
    },
    icon: 'roundRect',  // 使用圆角矩形作为图例图标
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
      label: {
        show: true, // 开启 label 显示
        formatter: function (params) {
          // 如果当前数据值为 0，则返回空字符串，隐藏 label
          return params.value === 0 ? '' : params.value;
       }
      },
      data: seriesData[key] // 使用对应字段的数据
    }))

    // 更新 xAxis 数据 (时间轴)
    lineChartOptions.xAxis.data = times
  },
  { immediate: true }
)
</script>