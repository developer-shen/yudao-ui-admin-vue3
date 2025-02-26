<template>
  <!-- 弹窗部分 -->
  <el-drawer v-model="dialogVisible" direction="btt" :with-header="false" size="95%" :before-close="handleClose">
    <!-- 使用 iframe 嵌入一个外部页面 -->
    <IFrame :src="iframeSrc" />
  </el-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getAccessToken } from '@/utils/auth'
const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const iframeSrc = ref('') // 设置页面的URL

/** 打开弹窗 */
const open = async (barcode: string) => {
  if (barcode === '' || barcode === undefined || barcode === null) { 
    message.error('商品信息不全')
    return
  }
  iframeSrc.value = import.meta.env.VITE_BASE_URL + '/jmreport/index/' + barcode + '?token=' + getAccessToken()
  dialogVisible.value = true
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

// 关闭弹窗的回调
const handleClose = () => {
  dialogVisible.value = false;
};
</script>